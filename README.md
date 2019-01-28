# Twitter2Slack

## 概念図

```
twitter REST API -> [tcast] -> Slack
```

## Setup

### config

Put `config.yml`

```
port: 8080
slack:
  channel: "#timeline"
  webhook: https://hooks.slack.com/services/T22222222/BDDDDDDDD/XYZZZZZZZZZZZZZZZZZZZZZZ
```

### Requirements

- [cympfh/twitter-broadcast (tcast)](https://github.com/cympfh/twitter-broadcast)

## Usage

Launch `tcast` on a machine and,

```bash
$ ./t2s
```
