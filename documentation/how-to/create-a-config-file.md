# How to create and use a configuration file

Let's assume you're in a situation where you want to use a global compliance period of 14 days, but due to technical limitations you are stuck to a specific version of ExpressJS and want to ignore it. Let's also assume you want to allow `captain-picard` 100 days to comply.

1. Create a `.json` configuration file, named anything you want, somewhere on your file system
2. Create a config with 2 rules for your specific use case and set the default compliance period to 14 days

    ```json
    {
      "defaultExpiration": 14,
      "rules": [
        {
            "dependencyName": "express",
            "ignore": true,
        },
        {
            "dependencyName": "captain-picard",
            "daysUntilExpiration": 100
        }
      ]
    }
    ```

3. Run Rotten Deps by using `rotten-deps --config-path <absolute-path-to-your-config>`. Rotten Deps will attempt to resolve a relative path which is useful if you're keeping it with your project but absolute path is preferred.

You should now see an output that reflects that `express` was ignored as well as not failing if you're other dependencies are within their defined compliance period. If this doesn't work as expected or you have questions feel free to drop us an issue on [our issue board](https://github.com/ominestre/rotten-deps/issues).

## Config Options

### `defaultExpiration: number`

This is a number value to use as the default expiration for all dependencies. This is overridden if any specific dependency has it's own expiration date.

### `rules: Array<Rule>`

This is a collection of rules for each dependency. The individual rules have the following properties:

- `dependencyName: string` The name of the dependency you're configuring a rule for
- OPTIONAL `ignore: boolean` Sets the dependency to be ignored. This will never trigger a fail due to being outdated.
- OPTIONAL `daysUntilExpiration: number` This sets the expiration period for the individual dependency
