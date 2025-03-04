/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'

// Create Virtual Routes

const OldindexLazyImport = createFileRoute('/old_index')()
const SelectLazyImport = createFileRoute('/select')()
const RuleLazyImport = createFileRoute('/rule')()
const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const OldindexLazyRoute = OldindexLazyImport.update({
  path: '/old_index',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/old_index.lazy').then((d) => d.Route))

const SelectLazyRoute = SelectLazyImport.update({
  path: '/select',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/select.lazy').then((d) => d.Route))

const RuleLazyRoute = RuleLazyImport.update({
  path: '/rule',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/rule.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/old_index': {
      id: '/old_index'
      path: '/old_index'
      fullPath: '/old_index'
      preLoaderRoute: typeof OldindexLazyImport
      parentRoute: typeof rootRoute
    }
    '/rule': {
      id: '/rule'
      path: '/rule'
      fullPath: '/rule'
      preLoaderRoute: typeof RuleLazyImport
      parentRoute: typeof rootRoute
    }
    '/select': {
      id: '/select'
      path: '/select'
      fullPath: '/select'
      preLoaderRoute: typeof SelectLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/old_index': typeof OldindexLazyRoute
  '/rule': typeof RuleLazyRoute
  '/select': typeof SelectLazyRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/old_index': typeof OldindexLazyRoute
  '/rule': typeof RuleLazyRoute
  '/select': typeof SelectLazyRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/old_index': typeof OldindexLazyRoute
  '/rule': typeof RuleLazyRoute
  '/select': typeof SelectLazyRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/old_index' | '/rule' | '/select'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/old_index' | '/rule' | '/select'
  id: '__root__' | '/' | '/old_index' | '/rule' | '/select'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  OldindexLazyRoute: typeof OldindexLazyRoute
  RuleLazyRoute: typeof RuleLazyRoute
  SelectLazyRoute: typeof SelectLazyRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  OldindexLazyRoute: OldindexLazyRoute,
  RuleLazyRoute: RuleLazyRoute,
  SelectLazyRoute: SelectLazyRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/old_index",
        "/rule",
        "/select"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/old_index": {
      "filePath": "old_index.lazy.tsx"
    },
    "/rule": {
      "filePath": "rule.lazy.tsx"
    },
    "/select": {
      "filePath": "select.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
