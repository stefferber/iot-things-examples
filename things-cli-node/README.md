# Suite CLI

## Usage

```bash
# basic usage
$ suite <cmd>
```

Existing commands (so far):

```bash
$ suite auth [options]
$ suite bind {subscription-credentials}
$ suite things search [options]
```

## TODO

```bash

# SuiteAuth
$ suite auth refresh

# Things
$ suite things getThing [thingName]
$ suite things putThing {thing}
$ suite things deleteThing [thingName]
$ suite things putThings [things]
$ suite things getPolicy [policyName]
$ suite things setPolicy {policy}
$ suite things deletePolicy [policyName]

# Asset communication
$ suite bisfac provision {thing}
$ suite bisfac provision [things]

# Permission ?
$ suite permission (add|delete|get [User])

# Faker service
$ suite faker fakeDevice {deviceConfig}
$ suite faker fakeDevices [deviceConfigs]

# Hub ?
# Rollouts .. etc. ?
```
