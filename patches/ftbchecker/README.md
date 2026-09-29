# FTBChecker UI patch

`ftbchecker-neoforge-1.21.1-1.3.0-steamon-ui.jar` is the official
[FTBChecker 1.3.0](https://modrinth.com/mod/ftbchecker) build with one class
(`MissingModsScreen`) bytecode-patched:

- The per-mod buttons are collapsed to 0x0 (invisible/unclickable) so the
  "missing mods" screen no longer overflows the window with 7+ entries.
- The remaining button is relabelled "Download all FTB missing mods" and
  downloads every missing mod when clicked, same as before.

No other behavior changes. Source is otherwise identical to upstream; see
`.pw.toml`'s `[download]` section, which points here instead of Modrinth
because Modrinth only serves the unmodified jar.

Re-do this patch whenever FTBChecker itself gets updated (check
`MissingModsScreen.class`'s bytecode still matches before reapplying).
