import { describe,it,expect,vi } from 'vitest';
import React, { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Page from '../client/src/components/BaysideSoutheastLocalJobsPage';
import { BAYSIDE_SOUTHEAST_BY_SLUG } from '../shared/baysideSoutheastLocalJobsContent';
vi.mock('@/components/ConversionTracking',()=>({trackPhoneCallClick:vi.fn(),trackEmailClick:vi.fn()}));
vi.mock('@/components/SEOHead',()=>({default:()=>null}));
vi.mock('framer-motion',()=>({motion:{div:({children}:{children:unknown})=>children},AnimatePresence:({children}:{children:unknown})=>children}));
describe('candidate actual header/footer content',()=>{
 it('contains no inherited legal/free-service claims or nonworking footer buttons',()=>{
  vi.stubGlobal('location',{pathname:'/areas/wynnum',search:'',hash:''});
  vi.stubGlobal('React',React);
  const html=renderToStaticMarkup(createElement(Page,{record:BAYSIDE_SOUTHEAST_BY_SLUG.wynnum}));
  expect(html).not.toMatch(/QBCC|licen[cs]e|insured|free quote|free guide|cost calculator|review score|testimonial/i);
  expect(html).toContain('href="/#services"');expect(html).toContain('href="/get-quote"');expect(html).toContain('href="/privacy"');
  expect(html).not.toContain('href="/areas/caboolture"');
  expect((html.match(/<main(?:\s|>)/g)||[])).toHaveLength(1);
  expect(html).not.toContain('application/ld+json');
 });
});
