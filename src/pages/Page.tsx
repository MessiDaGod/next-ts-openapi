/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import {Suspense} from 'react';
import * as React from 'react';
import {useRouter} from 'next/router';
import Nav from './Nav';
// import SocialBanner from '../SocialBanner';

import {getRouteMeta, RouteItem} from './getRouteMeta';
import sidebarLearn from 'sidebarLearn.json';
import sidebarReference from 'sidebarReference.json';

interface PageProps {
  children: React.ReactNode;
  routeTree: RouteItem;
  meta: {title?: string; description?: string};
  section: 'learn' | 'reference' | 'home';
}

export function Page({children, routeTree, meta, section}: PageProps) {
  const {asPath} = useRouter();
  const cleanedPath = asPath.split(/[\?\#]/)[0];
  const {route, nextRoute, prevRoute, breadcrumbs} = getRouteMeta(
    cleanedPath,
    routeTree
  );
  const title = meta.title || route?.title || '';
  const description = meta.description || route?.description || '';
  const isHomePage = cleanedPath === '/';
  return (
    <>
      {/* <SocialBanner /> */}
      <div className="grid grid-cols-only-content lg:grid-cols-sidebar-content 2xl:grid-cols-sidebar-content-toc">
        <div className="fixed lg:sticky top-0 left-0 right-0 py-0 shadow lg:shadow-none z-50">
          <Nav
            routeTree={routeTree}
            breadcrumbs={breadcrumbs}
            section={section}
          />
        </div>
        {/* No fallback UI so need to be careful not to suspend directly inside. */}
        <Suspense fallback={null}>
          <main className="min-w-0">
            <div className="lg:hidden h-16 mb-2" />
          </main>
        </Suspense>
      </div>
    </>
  );
}
