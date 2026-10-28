# AllTheMons x Mega Showdown

Self-hosted, not referenced through `[update.modrinth]`. The addon's
own Modrinth metadata lists both AllTheMons and Mega Showdown as
required dependencies, but AllTheMons itself refuses to load whenever
Mega Showdown is present ("Download ATM x MSD instead if you use Mega
Showdown!"). `packwiz modrinth export` follows that dependency and
silently re-adds AllTheMons to the pack on every publish, which
crashes the server on boot.

Self-hosting here breaks that automatic dependency resolution. Update
manually when a new version is released: download the addon zip (not
the mod jar) from https://modrinth.com/mod/atm-x-msd, replace the file
in this folder, and update the hash in `client/mods/atm-x-msd.pw.toml`
and `server/mods/atm-x-msd.pw.toml`.

Current version: v5.0 (2026-10-16), compatible with Cobblemon 1.8.2
and Mega Showdown 1.3.1+.
