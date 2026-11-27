# 운영 이미지(OPS-004, OPERATIONS 운영 구성). 빌드 단계에서 클라이언트·서버를 빌드하고
# 실행 단계에는 운영 의존성과 빌드 결과만 둔다. 비밀값은 이미지에 넣지 않고 실행 때 환경 변수로 받는다.
FROM node:24-bookworm-slim AS build
WORKDIR /app
# 의존성 층을 소스 변경과 분리해 캐시한다.
COPY package.json package-lock.json .npmrc ./
COPY packages/client/package.json packages/client/
COPY packages/game-core/package.json packages/game-core/
COPY packages/game-runtime/package.json packages/game-runtime/
COPY packages/server/package.json packages/server/
COPY packages/shared/package.json packages/shared/
RUN npm ci --include=dev
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
# 서버 번들은 워크스페이스 패키지를 포함한다(tsup noExternal). 마이그레이션·클라이언트 빌드는 index.ts가 상대 경로로 찾는다.
COPY --from=build /app/packages/server/package.json packages/server/
COPY --from=build /app/packages/server/dist packages/server/dist
COPY --from=build /app/packages/server/drizzle packages/server/drizzle
COPY --from=build /app/packages/client/dist packages/client/dist
USER node
EXPOSE 3000
CMD ["node", "packages/server/dist/index.js"]
