# frontend

The live portfolio site, served at https://michael-dickinson.com. A single page: hero (bio + team photo), selected work, timeline.

```bash
pnpm install
pnpm dev          # local dev server
pnpm build        # typecheck + production build to dist/
pnpm preview      # preview the production build
pnpm run deploy   # build, sync to S3, invalidate CloudFront (runs tofu apply in ../infra)
```

- Copy: `src/content.ts`
- Design: `src/styles.css`
- Hero photo settings: `src/photo.ts`
- Resume: `public/resume.pdf`

See `CLAUDE.md` for the architecture and the root `README.md` for hosting and deployment.
