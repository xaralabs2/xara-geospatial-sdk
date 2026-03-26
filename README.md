# @xaralabs/geospatial-client

  The official TypeScript/JavaScript SDK for the **Xara Geospatial Engine** — a multi-tenant spatial intelligence API built on PostGIS, H3 hexagonal indexing, and geohash encoding.

  [![npm version](https://img.shields.io/npm/v/@xaralabs/geospatial-client.svg)](https://www.npmjs.com/package/@xaralabs/geospatial-client)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

  ---

  ## Why This SDK?

  Building location-aware applications requires solving the same hard problems repeatedly — spatial indexing, coordinate resolution, boundary lookups, parcel management, and entity tracking. The Xara Geospatial Engine handles all of this as a managed API, and this SDK gives you type-safe access from any TypeScript or JavaScript application.

  **Without Xara**, you would need to:
  - Set up and maintain PostGIS infrastructure
  - Implement H3 and geohash indexing yourself
  - Build parcel geometry management with split/merge/versioning
  - Create your own spatial identity system
  - Handle multi-tenant data isolation
  - Build real-time spatial event streaming

  **With this SDK**, you get all of that through simple function calls with full TypeScript autocompletion and type safety.

  ---

  ## Use Cases

  ### Property & Land Management
  Track parcels with auto-generated Global Parcel IDs (GPIDs), detect boundary overlaps, split and merge parcels, and maintain full version history with temporal queries.

  ```typescript
  // Create a parcel — GPID is auto-generated
  const parcel = await client.createParcel({
    property_id: 'lot-42',
    polygon_coordinates: [
      [3.4219, 6.4541], [3.4225, 6.4541],
      [3.4225, 6.4535], [3.4219, 6.4535],
      [3.4219, 6.4541]
    ]
  });
  // parcel.gpid → "GPID-NG-LA-IKJ-a1b2c3d4"

  // Check for overlaps before registering new land
  const overlap = await client.checkParcelOverlap({
    polygon_coordinates: newBoundary
  });

  // Split a parcel into subdivisions
  const split = await client.splitParcel(parcel.id, {
    child_polygons: [subdivisionA, subdivisionB]
  });
  ```

  ### Fleet & Delivery Logistics
  Track vehicles and delivery agents in real-time, find nearby drivers, calculate distances, and manage delivery zones.

  ```typescript
  // Register a delivery vehicle
  await client.createEntity({
    entity_type: 'vehicle',
    entity_id: 'truck-007',
    latitude: 6.4541,
    longitude: 3.4219
  });

  // Find all drivers within 2km of a pickup location
  const nearby = await client.searchNearby({
    lat: 6.4541, lon: 3.4219,
    radius: 2000,
    entity_type: 'driver'
  });

  // Calculate distance between warehouse and customer
  const distance = await client.calculateDistance({
    from: { lat: 6.4541, lon: 3.4219 },
    to: { lat: 6.5100, lon: 3.3792 }
  });
  // distance.distance_km → 8.34
  ```

  ### Security & Surveillance Intelligence
  Power camera networks with spatial context — resolve camera locations to administrative boundaries, find nearby infrastructure, and stream spatial events.

  ```typescript
  // Resolve a camera's location to its administrative context
  const location = await client.resolveLocation(6.4541, 3.4219);
  // → { address, admin_area, locality, ... }

  // Find what boundaries contain a detection point
  const boundaries = await client.resolveBoundary(6.4541, 3.4219);
  // → [{ name: "Ikeja", type: "LGA", ... }]

  // Stream spatial events in real-time
  const events = await client.streamEvents();
  // → Server-Sent Events stream of spatial activity
  ```

  ### Spatial Data Infrastructure
  Build and traverse spatial relationship graphs, create globally unique spatial identifiers, and perform H3-based clustering analysis.

  ```typescript
  // Create a Global Spatial ID for any coordinate
  const gsid = await client.createGSID({
    latitude: 6.4541,
    longitude: 3.4219,
    label: 'HQ Office'
  });
  // gsid.gsid → "GSID-8867369-1a2b3c"

  // Build a spatial graph
  const zone = await client.createGraphNode({
    node_type: 'zone',
    label: 'Downtown District',
    latitude: 6.4541,
    longitude: 3.4219
  });

  // Cluster entities by H3 hexagons
  const clusters = await client.cluster({
    resolution: 7,
    entity_type: 'sensor'
  });
  ```

  ---

  ## Installation

  ```bash
  # npm
  npm install @xaralabs/geospatial-client

  # pnpm
  pnpm add @xaralabs/geospatial-client

  # yarn
  yarn add @xaralabs/geospatial-client
  ```

  **Requirements:** Node.js 18+ (uses native `fetch`)

  ---

  ## Quick Start

  ```typescript
  import { XaraGeoClient } from '@xaralabs/geospatial-client';

  const client = new XaraGeoClient({
    baseUrl: 'https://your-engine-url.com/api',
    tenantId: 'your-tenant-id',
    apiKey: 'sk_live_your_api_key'
  });

  // Verify connection
  const health = await client.health();
  console.log(health.status); // "ok"
  ```

  ---

  ## API Reference

  ### Configuration

  ```typescript
  interface XaraGeoClientConfig {
    baseUrl: string;     // Your Xara Geospatial Engine API URL
    tenantId: string;    // Your tenant identifier
    apiKey: string;      // Your API key (starts with sk_live_)
    timeout?: number;    // Request timeout in ms (default: 30000)
  }
  ```

  ### Spatial Entities

  Entities are any geolocated objects — vehicles, sensors, cameras, people, buildings.

  | Method | Description |
  |--------|-------------|
  | `createEntity(params)` | Register a new spatial entity |
  | `searchNearby(params)` | Find entities within a radius |
  | `searchPolygon(params)` | Find entities within a polygon |

  ```typescript
  // Create
  const entity = await client.createEntity({
    entity_type: 'sensor',
    entity_id: 'temp-sensor-42',
    latitude: 6.4541,
    longitude: 3.4219
  });

  // Search nearby (radius in meters)
  const nearby = await client.searchNearby({
    lat: 6.4541, lon: 3.4219,
    radius: 500,
    entity_type: 'sensor' // optional filter
  });

  // Search within polygon
  const inArea = await client.searchPolygon({
    polygon: [[3.42, 6.45], [3.43, 6.45], [3.43, 6.46], [3.42, 6.46], [3.42, 6.45]],
    entity_type: 'sensor'
  });
  ```

  ### Parcels & Land Management

  Full parcel lifecycle — create, split, merge, version, and query lineage.

  | Method | Description |
  |--------|-------------|
  | `createParcel(params)` | Create a parcel with auto-generated GPID |
  | `getParcel(id)` | Get parcel details |
  | `checkParcelOverlap(params)` | Check if a polygon overlaps existing parcels |
  | `splitParcel(id, params)` | Split a parcel into children |
  | `mergeParcels(params)` | Merge multiple parcels into one |
  | `getParcelVersions(id)` | Get version history |
  | `createParcelVersion(id, params)` | Create a new geometry version |
  | `getParcelLineage(id)` | Get split/merge ancestry |

  ```typescript
  // Create with auto-GPID
  const parcel = await client.createParcel({
    property_id: 'block-7-lot-3',
    polygon_coordinates: [
      [3.4219, 6.4541], [3.4225, 6.4541],
      [3.4225, 6.4535], [3.4219, 6.4535],
      [3.4219, 6.4541] // closed ring
    ]
  });
  console.log(parcel.gpid);     // "GPID-NG-LA-IKJ-a1b2c3d4"
  console.log(parcel.area_sq_m); // 2847.5

  // Split into two lots
  const split = await client.splitParcel(parcel.id, {
    child_polygons: [lotA_coords, lotB_coords]
  });

  // Merge parcels
  const merged = await client.mergeParcels({
    parent_parcel_ids: [parcelA.id, parcelB.id],
    merged_polygon: combinedCoords
  });

  // Query full lineage
  const lineage = await client.getParcelLineage(parcel.id);
  ```

  ### Location & Boundary Resolution

  Resolve any coordinate to structured address and administrative boundary information.

  | Method | Description |
  |--------|-------------|
  | `resolveLocation(lat, lon)` | Reverse geocode to structured address |
  | `resolveBoundary(lat, lon)` | Find containing administrative boundaries |
  | `searchLocations(query)` | Forward geocode / text search |

  ```typescript
  const location = await client.resolveLocation(6.4541, 3.4219);
  // → { formatted_address, admin_area, locality, ... }

  const boundaries = await client.resolveBoundary(6.4541, 3.4219);
  // → [{ name: "Ikeja", type: "LGA" }, { name: "Lagos", type: "State" }]

  const results = await client.searchLocations('Ikeja Lagos');
  // → [{ lat, lon, formatted_address, ... }]
  ```

  ### Distance & Roads

  Calculate distances and find nearby road infrastructure.

  | Method | Description |
  |--------|-------------|
  | `calculateDistance(params)` | Haversine distance between two points |
  | `getNearbyRoads(params)` | Find road segments near a point |

  ```typescript
  const dist = await client.calculateDistance({
    from: { lat: 6.4541, lon: 3.4219 },
    to: { lat: 6.5100, lon: 3.3792 }
  });
  console.log(dist.distance_km);  // 8.34
  console.log(dist.bearing);      // 312.5

  const roads = await client.getNearbyRoads({
    lat: 6.4541, lon: 3.4219,
    radius: 200
  });
  ```

  ### Global Spatial Identity (GSID)

  Create and resolve globally unique spatial identifiers for any coordinate.

  | Method | Description |
  |--------|-------------|
  | `createGSID(params)` | Generate a new GSID |
  | `getGSID(id)` | Look up a GSID |
  | `resolveGSID(gsid)` | Resolve a GSID string to its location |

  ```typescript
  const gsid = await client.createGSID({
    latitude: 6.4541,
    longitude: 3.4219,
    label: 'Main Office'
  });
  console.log(gsid.gsid); // "GSID-8867369-1a2b3c"

  // Resolve back to location
  const resolved = await client.resolveGSID('GSID-8867369-1a2b3c');
  ```

  ### Spatial Graph

  Build and query spatial relationship networks.

  | Method | Description |
  |--------|-------------|
  | `createGraphNode(params)` | Create a graph node |
  | `createGraphEdge(params)` | Create an edge between nodes |
  | `getGraphChildren(nodeId)` | Get child nodes |
  | `getGraphParents(nodeId)` | Get parent nodes |
  | `getGraphConnected(nodeId)` | Get all connected nodes |
  | `getGraphNodeDetail(nodeId)` | Get full node detail |

  ```typescript
  // Build a zone hierarchy
  const city = await client.createGraphNode({
    node_type: 'city', label: 'Lagos',
    latitude: 6.5244, longitude: 3.3792
  });

  const district = await client.createGraphNode({
    node_type: 'district', label: 'Ikeja',
    latitude: 6.4541, longitude: 3.4219
  });

  await client.createGraphEdge({
    from_node_id: city.id,
    to_node_id: district.id,
    edge_type: 'contains',
    weight: 1.0
  });

  // Traverse
  const children = await client.getGraphChildren(city.id);
  ```

  ### Events & Clustering

  Ingest and stream spatial events, perform H3-based clustering.

  | Method | Description |
  |--------|-------------|
  | `getEvents(params)` | Query spatial events |
  | `streamEvents()` | Real-time SSE event stream |
  | `getH3Stats(params)` | H3 hexagonal statistics |
  | `cluster(params)` | Spatial clustering |

  ```typescript
  // Query events
  const events = await client.getEvents({
    event_type: 'detection',
    limit: 50
  });

  // H3 density analysis
  const stats = await client.getH3Stats({
    resolution: 7,
    entity_type: 'camera'
  });

  // Cluster entities
  const clusters = await client.cluster({
    resolution: 6,
    entity_type: 'vehicle'
  });
  ```

  ---

  ## Error Handling

  The SDK provides typed error classes for different failure scenarios:

  ```typescript
  import {
    XaraGeoError,        // Base error (any API error)
    XaraAuthError,       // 401 — invalid tenant ID or API key
    XaraNotFoundError,   // 404 — resource not found
    XaraValidationError, // 400 — invalid request parameters
    XaraRateLimitError   // 429 — rate limit exceeded
  } from '@xaralabs/geospatial-client';

  try {
    const parcel = await client.getParcel('non-existent-id');
  } catch (error) {
    if (error instanceof XaraNotFoundError) {
      console.log('Parcel not found');
    } else if (error instanceof XaraAuthError) {
      console.log('Check your tenant ID and API key');
    } else if (error instanceof XaraRateLimitError) {
      console.log('Slow down — retry after a moment');
    } else if (error instanceof XaraValidationError) {
      console.log('Invalid parameters:', error.message);
    }
  }
  ```

  ---

  ## Multi-Tenant Architecture

  Each API call is scoped to your tenant. Data is fully isolated — you will never see another tenant's entities, parcels, or events.

  ```
  Your App  →  SDK (tenantId + apiKey)  →  Xara Engine  →  Your Data Only
  ```

  The SDK automatically attaches your `X-TENANT-ID` and `X-API-KEY` headers to every request.

  ---

  ## Platform Architecture

  This SDK connects to the **Xara Geospatial Engine**, the foundational layer of the Xara Spatial Intelligence Platform:

  ```
  ┌─────────────────────────────────────────────────┐
  │  Your Application                               │
  │  (uses @xaralabs/geospatial-client)             │
  └──────────────────┬──────────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────────────┐
  │  Xara Geospatial Engine (this SDK connects here)│
  │  Coordinate resolution, spatial indexing,       │
  │  parcel management, GPID/GSID, event streaming  │
  └──────────────────┬──────────────────────────────┘
                     │
            ┌────────┴────────┐
            ▼                 ▼
  ┌──────────────┐  ┌──────────────────┐
  │ CSI Platform │  │ Cortex AI Engine │
  │ Spatial      │  │ Event reasoning, │
  │ intelligence │  │ anomaly detect.  │
  └──────────────┘  └──────────────────┘
  ```

  ### Products Built on This Platform

  | Product | Use Case |
  |---------|----------|
  | **SoliDeo** | Land & property management with parcel tracking |
  | **MacroLens** | Macro-level geospatial analytics and trend visualization |
  | **PicckR** | Location-intelligent delivery and logistics optimization |
  | **Xara Cortex** | Spatial forensic intelligence for security investigations |

  ---

  ## SDK Features

  - **Full TypeScript types** — every request and response is typed
  - **Automatic error classification** — typed error classes for each HTTP status
  - **Request timeout** — configurable per-client with AbortController
  - **Tree-shakable** — ESM and CJS dual exports
  - **Zero runtime dependencies** — uses native `fetch` (Node 18+)
  - **Comprehensive JSDoc** — inline documentation in your editor

  ---

  ## License

  MIT

  ---

  ## Links

  - [npm package](https://www.npmjs.com/package/@xaralabs/geospatial-client)
  - [GitHub repository](https://github.com/xaralabs2/xara-geospatial-sdk)
  - [Xara Labs](https://github.com/xaralabs2)
  