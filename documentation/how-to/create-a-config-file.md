# How to create and use a configuration file

Let's assume you're in a situation where you want to use a global compliance period of 14 days, but due to technical limitations you are stuck to a specific version of ExpressJS and want to ignore it. Let's also assume you want to allow `captain-picard` 100 days to comply.

1. Create a `.json` configuration file, named anything you want, somewhere on your file system
2. Create a config with 2 rules for your specific use case

    ```json
    {
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

## Options

### Rules: `Array<Rule>`

#### Rule

##### dependencyName: string

This is the exact name of the dependency you are configuring a rule for.

##### OPTIONAL ignore: boolean

If this value is set to true then this specific dependency being outdated will not trigger a failure. It will still show up in the report.

##### OPTIONAL daysUntilExpiration: number

This value sets the compliance period, measured in days, for the specific dependency.
