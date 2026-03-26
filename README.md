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

  // Resolve a location from coordinates
  const location = await geo.resolveLocation(6.4498, 3.4743);
  console.log(location.district); // "Lekki Phase 1"

  // Create a GSID
  const gsid = await geo.createGSID({
    name: "Lekki Phase 1",
    gsid_type: "district",
    latitude: 6.4498,
    longitude: 3.4743,
    zone: "Lekki",
  });
  console.log(gsid.gsid); // "XG-NG-LAG-LEK-000001"

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

  ### Location Resolution

  #### `resolveLocation(lat, lng)`

  Resolve coordinates to a location identity via boundary containment.

  ```typescript
  const result = await geo.resolveLocation(6.4498, 3.4743);
  // Returns: { resolved: true, district: "Lekki Phase 1", city: "Lagos", state: "Lagos", country: "Nigeria", boundaries: [...] }
  ```

  #### `resolveBoundary(lat, lng)`

  Find all boundaries containing a point.

  ```typescript
  const result = await geo.resolveBoundary(6.45, 3.47);
  // Returns: { boundaries: [{ name, boundary_type, country, state, city }], count }
  ```

  #### `searchLocations(query, limit?)`

  Fuzzy search locations by name.

  ```typescript
  const result = await geo.searchLocations("lekki", 20);
  // Returns: { results: [{ id, name, location_type, latitude, longitude, ... }], count }
  ```

  ### Distance & Roads

  #### `calculateDistance(params)`

  Calculate distance between two points.

  ```typescript
  const result = await geo.calculateDistance({
    pointA: [6.4498, 3.4743],
    pointB: [6.4281, 3.4219],
  });
  // Returns: { distance: { meters: 6272.54, kilometers: 6.27 } }
  ```

  #### `findNearbyRoads(params)`

  Find nearby road segments within a radius.

  ```typescript
  const result = await geo.findNearbyRoads({
    lat: 6.445,
    lng: 3.47,
    radius: 2000, // meters, default 500
    limit: 10,     // default 10
  });
  // Returns: { roads: [{ id, name, road_type, city, speed_limit, distance_meters }], count }
  ```

  ### GSID (Global Spatial Identity)

  #### `createGSID(params)`

  Create a new GSID entry.

  ```typescript
  const entry = await geo.createGSID({
    name: "Lekki Phase 1",
    gsid_type: "district",
    latitude: 6.4498,
    longitude: 3.4743,
    country: "Nigeria",
    state: "Lagos",
    city: "Lagos",
    zone: "Lekki",
  });
  // Returns: { id, gsid: "XG-NG-LAG-LEK-000001", name, gsid_type, ... }
  ```

  #### `lookupGSID(gsid)`

  Lookup a GSID by its identifier.

  ```typescript
  const entry = await geo.lookupGSID("XG-NG-LAG-LEK-000001");
  ```

  #### `resolveGSID(lat, lng, radius?)`

  Find nearest GSIDs to a coordinate.

  ```typescript
  const result = await geo.resolveGSID(6.45, 3.474, 5000);
  // Returns: { results: [{ ...gsidEntry, distance_meters }], count }
  ```

  ### Spatial Graph

  #### `createGraphNode(params)`

  Create a graph node.

  ```typescript
  const node = await geo.createGraphNode({
    node_type: "boundary",
    name: "Nigeria",
    latitude: 9.0,
    longitude: 7.5,
  });
  ```

  #### `createGraphEdge(params)`

  Create a directed edge between nodes.

  ```typescript
  const edge = await geo.createGraphEdge({
    from_node_id: lagosId,
    to_node_id: nigeriaId,
    relation_type: "INSIDE",
  });
  ```

  #### `getGraphChildren(nodeId)`

  Get child nodes (nodes with INSIDE relationship to this node).

  ```typescript
  const result = await geo.getGraphChildren(nigeriaId);
  // Returns: { children: [{ id, graph_node_type, name, ... }], count }
  ```

  #### `getGraphParents(nodeId)`

  Get parent nodes.

  ```typescript
  const result = await geo.getGraphParents(lekkiId);
  // Returns: { parents: [{ id, graph_node_type: "boundary", name: "Lagos", ... }], count }
  ```

  #### `getGraphConnected(nodeId, relation?)`

  Get all connected nodes, optionally filtered by relation type.

  ```typescript
  const result = await geo.getGraphConnected(lagosId);
  // Returns: { connected: [{ ...node, relation: "INSIDE" }], count }
  ```

  #### `getGraphNode(nodeId)`

  Get full node details with all edges.

  ```typescript
  const result = await geo.getGraphNode(lagosId);
  // Returns: { node: {...}, edges: [{ from_name, to_name, graph_relation_type, ... }] }
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
  ```

  #### `mergeParcels(params)`

  Merge multiple parcels into one.

  ```typescript
  const result = await geo.mergeParcels({
    parent_parcel_ids: [parcelId1, parcelId2],
    merged_polygon: [[3.35, 6.45], ...],
  });
  ```

  #### `getParcelLineage(parcelId)`

  Get the lineage history (splits, merges) for a parcel.

  ```typescript
  const lineage = await geo.getParcelLineage(parcelId);
  ```

  ### Spatial Events

  #### `getSpatialEvents(params?)`

  Get spatial event audit trail.

  ```typescript
  const events = await geo.getSpatialEvents({
    event_type: "PARCEL_CREATED",
    limit: 50,
  });
  ```

  ### Analytics & Clustering

  #### `getH3Stats(params)`

  Get spatial analytics metrics by H3 cell.

  ```typescript
  const stats = await geo.getH3Stats({
    h3_index: "89589c99207ffff",
    metric_type: "density",
  });
  ```

  #### `runSpatialCluster(params)`

  Cluster spatial entities using DBSCAN, K-means, or H3.

  ```typescript
  const clusters = await geo.runSpatialCluster({
    algorithm: "dbscan",
    epsilon: 500,
    min_points: 3,
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
      console.log(err.message);
      console.log(err.reason);
    } else if (err instanceof XaraAuthError) {
      console.log("Authentication failed");
    } else if (err instanceof XaraNotFoundError) {
      console.log("Resource not found");
    } else if (err instanceof XaraRateLimitError) {
      console.log("Rate limited, retry later");
    }
  }
  ```

  ## Identity Formats

  **GPID** (Global Parcel Identity): `GPID-{COUNTRY}-{STATE}-{CITY}-{SEQUENCE}`
  - Example: `GPID-NG-LAG-LEK-000042`
  - Immutable, represents physical land

  **GSID** (Global Spatial Identity): `XG-{COUNTRY}-{CITY}-{ZONE}-{SEQUENCE}`
  - Example: `XG-NG-LAG-LEK-000001`
  - Identifies spatial locations, districts, landmarks

  ## Rate Limits

  - 1000 requests per minute per tenant
  - SDK throws `XaraRateLimitError` when limit is exceeded

  ## License

  MIT
  