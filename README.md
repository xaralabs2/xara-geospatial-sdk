# @xaralabs/geospatial-client

Official TypeScript/JavaScript SDK for the Xara Geospatial Engine API.

## Installation

```bash
npm install @xaralabs/geospatial-client
```

## Quick Start

```typescript
import { XaraGeoClient } from "@xaralabs/geospatial-client";

const geo = new XaraGeoClient({
  baseUrl: "https://geo.xaralabs.ai/api",
  tenantId: "solideo",
  apiKey: "sk_live_xxxxx",
});

// Create a parcel with GPID
const parcel = await geo.createParcel({
  property_id: "550e8400-e29b-41d4-a716-446655440000",
  polygon_coordinates: [
    [3.35, 6.45],
    [3.36, 6.45],
    [3.36, 6.46],
    [3.35, 6.46],
    [3.35, 6.45],
  ],
});

console.log(parcel.gpid); // GPID-NG-LAG-IKJ-000001
```

## Authentication

The SDK automatically injects authentication headers on every request:

- `X-TENANT-ID` — your tenant identifier
- `X-API-KEY` — your API key

## API Reference

### Initialization

```typescript
const geo = new XaraGeoClient({
  baseUrl: "https://geo.xaralabs.ai/api", // API base URL
  tenantId: "solideo",                      // Your tenant ID
  apiKey: "sk_live_xxxxx",                  // Your API key
  timeout: 30000,                           // Request timeout in ms (optional)
});
```

### Spatial Entities

#### `createSpatialEntity(params)`

Create a spatial entity (property, vehicle, sensor, etc.).

```typescript
const entity = await geo.createSpatialEntity({
  entity_type: "property",
  entity_id: "550e8400-e29b-41d4-a716-446655440000",
  latitude: 6.45,
  longitude: 3.35,
});
```

#### `searchNearby(params)`

Find entities within a radius (meters).

```typescript
const results = await geo.searchNearby({
  lat: 6.45,
  lon: 3.35,
  radius: 5000,
  entity_type: "property", // optional
});
```

#### `polygonSearch(params)`

Find entities within a polygon.

```typescript
const results = await geo.polygonSearch({
  polygon: [
    [3.35, 6.45],
    [3.36, 6.45],
    [3.36, 6.46],
    [3.35, 6.46],
    [3.35, 6.45],
  ],
  entity_type: "property", // optional
});
```

### Parcel Registry

#### `createParcel(params)`

Create a parcel with automatic GPID generation.

```typescript
const parcel = await geo.createParcel({
  property_id: "550e8400-e29b-41d4-a716-446655440000",
  polygon_coordinates: [
    [3.35, 6.45],
    [3.36, 6.45],
    [3.36, 6.46],
    [3.35, 6.46],
    [3.35, 6.45],
  ],
});
// Returns: { id, gpid, status, geohash, h3_index, area_sq_m, ... }
```

#### `checkParcelOverlap(params)`

Check for overlapping parcels.

```typescript
const overlaps = await geo.checkParcelOverlap({
  polygon_coordinates: [[3.35, 6.45], ...],
});
```

### Parcel Versioning

#### `createParcelVersion(parcelId, params)`

Create a new geometry version for a parcel.

```typescript
const version = await geo.createParcelVersion(parcelId, {
  polygon_coordinates: [[3.351, 6.451], ...],
});
// Returns: { id, version_number, geometry_hash, valid_from, ... }
```

#### `getParcelVersions(parcelId)`

Get all versions of a parcel.

```typescript
const versions = await geo.getParcelVersions(parcelId);
```

### Parcel Lineage

#### `splitParcel(parcelId, params)`

Split a parcel into child parcels.

```typescript
const result = await geo.splitParcel(parcelId, {
  child_polygons: [
    [[3.35, 6.45], [3.355, 6.45], [3.355, 6.46], [3.35, 6.46], [3.35, 6.45]],
    [[3.355, 6.45], [3.36, 6.45], [3.36, 6.46], [3.355, 6.46], [3.355, 6.45]],
  ],
});
// Parent status changes to 'split'
// Returns: { parent_parcel_id, child_parcels, event_type }
```

#### `mergeParcels(params)`

Merge multiple parcels into one.

```typescript
const result = await geo.mergeParcels({
  parent_parcel_ids: [parcelId1, parcelId2],
  merged_polygon: [[3.35, 6.45], ...],
});
// Parent statuses change to 'merged'
// Returns: { merged_parcel, parent_parcel_ids, event_type }
```

#### `getParcelLineage(parcelId)`

Get the lineage history (splits, merges) for a parcel.

```typescript
const lineage = await geo.getParcelLineage(parcelId);
// Returns: [{ parent_parcel_id, child_parcel_id, event_type, parent_gpid, child_gpid, ... }]
```

### Spatial Events

#### `getSpatialEvents(params?)`

Get spatial event audit trail.

```typescript
const events = await geo.getSpatialEvents({
  event_type: "PARCEL_CREATED", // optional
  limit: 50,                     // optional, default 100
});
```

### Analytics

#### `getH3Stats(params)`

Get spatial analytics metrics by H3 cell.

```typescript
const stats = await geo.getH3Stats({
  h3_index: "89589c99207ffff",
  metric_type: "density", // optional
});
```

### Clustering

#### `runSpatialCluster(params)`

Cluster spatial entities using DBSCAN, K-means, or H3.

```typescript
// DBSCAN
const clusters = await geo.runSpatialCluster({
  algorithm: "dbscan",
  epsilon: 500,     // meters
  min_points: 3,
});

// K-means
const clusters = await geo.runSpatialCluster({
  algorithm: "kmeans",
  k: 5,
});

// H3
const clusters = await geo.runSpatialCluster({
  algorithm: "h3",
  resolution: 7,
});
```

### Health

#### `healthCheck()`

Check API health status.

```typescript
const health = await geo.healthCheck();
console.log(health.status); // "ok"
```

## Error Handling

The SDK provides typed error classes:

```typescript
import {
  XaraGeoError,
  XaraAuthError,
  XaraNotFoundError,
  XaraValidationError,
  XaraRateLimitError,
} from "@xaralabs/geospatial-client";

try {
  await geo.createParcel({ ... });
} catch (err) {
  if (err instanceof XaraValidationError) {
    console.log(err.message);  // "Invalid geometry"
    console.log(err.reason);   // "Self-intersection[3.355 6.455]"
  } else if (err instanceof XaraAuthError) {
    console.log("Authentication failed");
  } else if (err instanceof XaraNotFoundError) {
    console.log("Resource not found");
  } else if (err instanceof XaraRateLimitError) {
    console.log("Rate limited, retry later");
  }
}
```

## Rate Limits

- 1000 requests per minute per tenant
- SDK throws `XaraRateLimitError` when limit is exceeded

## GPID Format

Global Parcel Identity format:

```
GPID-{COUNTRY}-{STATE}-{CITY}-{SEQUENCE}
```

Example: `GPID-NG-LAG-LEK-000042`

- GPID is immutable
- GPID represents physical land
- GPID survives ownership changes

## License

MIT
