# ieasybooks launches

Launch films for ieasybooks products, built with [Remotion](https://www.remotion.dev).

- [Aljam3 Desktop](aljam3-desktop/README.md): the Arabic launch film for the Aljam3 desktop app.
- [Aljam3 MCP](aljam3-mcp/README.md): the Arabic launch film for the Aljam3 public MCP server.
- [Aljam3 MCP setup](aljam3-mcp-setup/README.md): the Arabic how-to film for connecting the MCP server to ChatGPT
  and Claude, recorded in the real products.
- [arabi.tools](arabi-tools/README.md): the Arabic motion-graphics launch film for arabi.tools (أدوات العربية),
  free tools for the Arabic language.
- [arabi.tools OCR](arabi-tools-ocr/README.md): the sequel for استخراج النص من الصور, with real classical-book OCR
  output, Arabic narration, and both aspect ratios.

The launch films render in 16:9 and 9:16, the setup film in 16:9. Each directory is a self-contained project with
its own dependencies, scripts, narration, demo data and assets. The launch films' original Git histories are
preserved.

## Quick start

Requires Node 20+, ffmpeg and Python 3 with [uv](https://docs.astral.sh/uv/).

From the repository root, choose a film:

```sh
cd aljam3-desktop # or aljam3-mcp, aljam3-mcp-setup, arabi-tools, arabi-tools-ocr
npm ci
npm run studio
```

Run all film commands from that film's directory. Use `npm run typecheck` to check its TypeScript,
and follow its README for rendering, captions, audio processing and voice-over generation.
The committed voice-over and sound effects let you render without an API key. Generated videos
and other output stay in each project's ignored `out/` directory.

## License

Code is MIT (see [LICENSE](LICENSE)). Each film's README lists its asset credits and licensing.
The Aljam3 name and logo belong to Aljam3. Remotion has
[its own license](https://www.remotion.dev/license).
