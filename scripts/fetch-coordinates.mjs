#!/usr/bin/env node
/**
 * Fetches campsite coordinates from NPS ArcGIS FeatureServer layers
 * and merges them into rmnp-sites.json → rmnp-sites-geo.json
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const ARCGIS_BASE = 'https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services';

const LAYERS = [
  {
    name: 'INDIV',
    url: `${ARCGIS_BASE}/ROMO_FACILITY_WildernessCampsite_INDIV_pt_public_VIEW/FeatureServer/0/query`,
  },
  {
    name: 'GROUP',
    url: `${ARCGIS_BASE}/ROMO_FACILITY_WildernessCampsite_GROUP_pt_public_VIEW/FeatureServer/0/query`,
  },
  {
    name: 'STOCK',
    url: `${ARCGIS_BASE}/ROMO_FACILITY_WildernessCampsite_STOCK_pt_public_VIEW/FeatureServer/0/query`,
  },
];

const QUERY_PARAMS = new URLSearchParams({
  f: 'GeoJSON',
  outSR: '4326',
  where: 'OBJECTID IS NOT NULL',
  outFields: '*',
});

async function fetchLayer(layer) {
  const url = `${layer.url}?${QUERY_PARAMS}`;
  console.log(`Fetching ${layer.name}...`);
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`${layer.name}: HTTP ${resp.status}`);
  const geojson = await resp.json();
  console.log(`  ${layer.name}: ${geojson.features?.length || 0} features`);
  return { layer: layer.name, features: geojson.features || [] };
}

function computeCentroids(allFeatures) {
  // Group coordinates by SiteCode
  const groups = new Map();

  for (const { layer, features } of allFeatures) {
    for (const f of features) {
      const props = f.properties || {};
      const coords = f.geometry?.coordinates;
      if (!coords || coords.length < 2) continue;

      // Try various field names for site code
      let code = props.SiteCode || props.SITE || props.Campsite || props.SITECODE || '';
      code = String(code).trim();
      if (!code) continue;

      // Normalize: remove leading zeros inconsistency, but keep the raw code
      if (!groups.has(code)) {
        groups.set(code, { lngs: [], lats: [], layer });
      }
      const g = groups.get(code);
      g.lngs.push(coords[0]);
      g.lats.push(coords[1]);
    }
  }

  // Compute centroid per code
  const centroids = new Map();
  for (const [code, g] of groups) {
    const lng = g.lngs.reduce((a, b) => a + b, 0) / g.lngs.length;
    const lat = g.lats.reduce((a, b) => a + b, 0) / g.lats.length;
    centroids.set(code, { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6, layer: g.layer });
  }

  return centroids;
}

function matchSiteCode(siteCode, centroids) {
  // Direct match
  if (centroids.has(siteCode)) return centroids.get(siteCode);

  // Try numeric-only match (e.g., "011G" → look in GROUP layer for "011")
  const numMatch = siteCode.match(/^(\d+)[GgSs]$/);
  if (numMatch) {
    const base = numMatch[1];
    // Check if the base exists in GROUP or STOCK layers
    if (centroids.has(base)) {
      const c = centroids.get(base);
      if (c.layer === 'GROUP' || c.layer === 'STOCK') return c;
    }
    // Fall back to base code in ANY layer (group/stock sites share location with individual)
    if (centroids.has(base)) return centroids.get(base);
  }

  // Try with leading zero variations
  const stripped = siteCode.replace(/^0+/, '');
  for (const [k, v] of centroids) {
    if (k.replace(/^0+/, '') === stripped) return v;
  }

  return null;
}

async function main() {
  // Fetch all layers in parallel
  const results = await Promise.all(LAYERS.map(fetchLayer));

  // Log all unique field names for debugging
  for (const { layer, features } of results) {
    if (features.length > 0) {
      console.log(`  ${layer} fields: ${Object.keys(features[0].properties || {}).join(', ')}`);
    }
  }

  const centroids = computeCentroids(results);
  console.log(`\nComputed ${centroids.size} centroids from ArcGIS`);

  // Read existing site data
  const sitesPath = join(ROOT, 'public/data/rmnp-sites.json');
  const sites = JSON.parse(await readFile(sitesPath, 'utf-8'));

  let matched = 0;
  let unmatched = 0;

  const geoSites = sites.map((site) => {
    const coords = matchSiteCode(site.code, centroids);
    if (coords) {
      matched++;
      return { ...site, lat: coords.lat, lng: coords.lng };
    }
    unmatched++;
    console.log(`  No coords for: ${site.code} (${site.name}) available=${site.available}`);
    return { ...site, lat: null, lng: null };
  });

  console.log(`\nMatched: ${matched}, Unmatched: ${unmatched} of ${sites.length} total`);

  // Write output
  const outPath = join(ROOT, 'public/data/rmnp-sites-geo.json');
  await writeFile(outPath, JSON.stringify(geoSites, null, 2) + '\n');
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
