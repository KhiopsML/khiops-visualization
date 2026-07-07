# Troubleshooting Cypress

If you run into this issue:

```
Opening Cypress...
  errno: -2,
  code: 'ERR_FAILED',
  url: 'http://localhost:51384/__launchpad/index.html'
```

run:

```bash
export NO_PROXY="localhost,127.0.0.1,${NO_PROXY}"
```
