# rotten deps

The command `npm outdated` only has two endpoints which are pass or fail. This dichotomy isn't very useful for CI
flows which have pass, fail, or warn. This CLI utility combines `npm outdated` and `npm view` in order to establish
a compliance period for dependency checks. This way if a dependency update is within your compliance period you can
trigger a warn or if it's beyond your compliance period it can trigger a fail.
