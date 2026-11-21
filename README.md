# makefun-gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/mikaelkarlmax/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/mikaelkarlmax/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Legend — an offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5. Every trophy carries a guide in our own words and numbered steps, and every step cites its sources from a dated registry of 26 launch-era sources. The app adds a 7-stage platinum roadmap, a missable watch list built around the one genuinely missable trophy (a Chapter 1 meditation), ten settled disputes where the launch guides disagree, a spoiler shield that blurs hidden trophies until clicked, and a checklist whose progress is saved in the browser and can be exported to and imported from a JSON file. An audit strip at the top counts the guide's own numbers live from its data: trophies guided, total steps, cited steps, multi-source steps, sources and PSN points.

The app is plain static files under `app/` with no build step and no network requests: serve `app/` with any static file server and open `index.html`.

## Run it

```sh
node main.ts
```

Outside the grader, `MAKEFUN_OUTPUT_DIR` stands in for `/output`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

To try the guide itself, serve the app folder:

```sh
node serve.ts
```

then open http://localhost:8080.

---

<sub>Entered on [make.fun](https://make.fun/?ref=q8z3gt64&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
