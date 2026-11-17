# Notes on moving CI to hosted runners

We moved CI from the old Jenkins box to hosted runners in March. The main reason was disk: the Jenkins machine kept filling up with Docker layers, and someone had to SSH in every other week to prune them.

The first week was rough. Two test suites relied on a local Postgres that was always running on the old box, so they failed on the new runners until we added a service container. I also forgot that the old machine had a warm Gradle cache, and our pipeline went from six minutes to fourteen.

Caching the Gradle directory brought it back to about seven. I'm not sure the remaining minute is worth chasing yet.

If you hit a flaky failure in the integration job, rerun it once before filing a ticket. We think it is a timing issue in the mail stub, but nobody has pinned it down.
