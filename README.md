This is an experiment in writing a plugin for Rollup that dynamically
calculates inputs to the compiler based on the contents of the `src` directory.

Currently, it seems that Rollup does not correctly watch for new files added to a
directory that is used in `this.addWatchFile`. This was [reported in #3704](https://github.com/rollup/rollup/issues/3704).

The `rollup.config.js` in this repo has 2 plugins:

- [`watchInputs`](https://github.com/mjackson/rollup-watch-dir/blob/master/rollup.config.js#L10) demonstrates the problem
- [`watchInputsWorkaround`](https://github.com/mjackson/rollup-watch-dir/blob/master/rollup.config.js#L27) demonstrates a workaround using a custom watcher and a
  temp file

To reproduce the problem:

- Run the build in watch mode using `npm run watch` (or `rollup -c -w`). You'll
  see the build output in the `build` directory.
- Now remove the `build` directory and add a new file to the `src` directory.
  You should not see another build.

To fix this, swap the `watchFiles` plugin for the `watchFilesWorkaround` plugin
in `rollup.config.js`. Re-run the test and you should see rebuilds when new
files are added to the `src` directory.


