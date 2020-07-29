import fs from "fs";
import path from "path";

// These are only needed for the workaround.
import chokidar from "chokidar";
import tmp from "tmp";

const src = path.resolve(__dirname, "src");

function watchInputs(watchFile, getInput) {
  return {
    name: "watch-inputs",
    options(options) {
      return {
        ...options,
        input: getInput()
      };
    },
    buildStart() {
      // Try to watch the src dir so we can trigger changes
      // as new files are created. But this doesn't work...
      this.addWatchFile(watchFile);
    }
  };
}

function watchInputsWorkaround(watchFile, getInput) {
  let startedWatcher = false;
  let tmpfile = tmp.fileSync();

  return {
    name: "watch-inputs-workaround",
    options(options) {
      return {
        ...options,
        input: getInput()
      };
    },
    buildStart() {
      if (!startedWatcher) {
        // Create our own watcher to watch the src dir for new files. When a new
        // file shows up, touch a tmp file to give Rollup a clue. The getInput
        // function will calculate new inputs to Rollup, so we don't need to
        // listen for unlink or change events because Rollup handles both of
        // these just fine.
        // https://github.com/rollup/rollup/blob/cd47fcf3169d9592e9065ec2d376859475d0b108/src/watch/fileWatcher.ts#L61-L62
        chokidar.watch(watchFile).on("add", () => {
          let now = new Date();
          fs.utimes(tmpfile.name, now, now, error => {
            if (error) console.error(error);
          });
        });

        startedWatcher = true;
      }

      // Watch the tmp file instead of the src dir...
      this.addWatchFile(tmpfile.name);
    }
  };
}

// This function grabs inputs from the contents of the src dir.
function getInput() {
  return fs
    .readdirSync(src)
    .map(file => path.join(src, file))
    .reduce((input, file) => {
      let chunkAlias = path.basename(file, ".js");
      input[chunkAlias] = file;
      return input;
    }, {});
}

export default {
  output: {
    dir: "./build",
    format: "esm"
  },
  plugins: [
    // This is broken...
    watchInputs(src, getInput)
    // But this works!
    // watchInputsWorkaround(src, getInput)
  ]
};
