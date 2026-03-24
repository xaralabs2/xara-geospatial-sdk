import { XaraGeoClient, XaraValidationError } from "@xaralabs/geospatial-client";

const geo = new XaraGeoClient({
  baseUrl: "https://geo.xaralabs.ai/api",
  tenantId: "solideo",
  apiKey: "sk_live_xxxxx",
});

async function main() {
  // Health check
  const health = await geo.healthCheck();
  console.log("Health:", health.status);

  // Create a spatial entity
  const entity = await geo.createSpatialEntity({
    entity_type: "property",
    entity_id: "550e8400-e29b-41d4-a716-446655440000",
    latitude: 6.45,
    longitude: 3.35,
  });
  console.log("Created entity:", entity.id, entity.geohash, entity.h3_index);

  // Search nearby
  const nearby = await geo.searchNearby({
    lat: 6.45,
    lon: 3.35,
    radius: 5000,
  });
  console.log("Found", nearby.length, "entities nearby");

  // Create a parcel with GPID
  const parcel = await geo.createParcel({
    property_id: "550e8400-e29b-41d4-a716-446655440001",
    polygon_coordinates: [
      [3.35, 6.45],
      [3.36, 6.45],
      [3.36, 6.46],
      [3.35, 6.46],
      [3.35, 6.45],
    ],
  });
  console.log("Created parcel:", parcel.gpid, "Status:", parcel.status);

  // Check for overlaps
  const overlaps = await geo.checkParcelOverlap({
    polygon_coordinates: [
      [3.35, 6.45],
      [3.36, 6.45],
      [3.36, 6.46],
      [3.35, 6.46],
      [3.35, 6.45],
    ],
  });
  console.log("Overlapping parcels:", overlaps.length);

  // Create a new parcel version
  const version = await geo.createParcelVersion(parcel.id, {
    polygon_coordinates: [
      [3.351, 6.451],
      [3.361, 6.451],
      [3.361, 6.461],
      [3.351, 6.461],
      [3.351, 6.451],
    ],
  });
  console.log("Version:", version.version_number, "Hash:", version.geometry_hash);

  // Get version history
  const versions = await geo.getParcelVersions(parcel.id);
  console.log("Total versions:", versions.length);

  // Split a parcel
  const splitResult = await geo.splitParcel(parcel.id, {
    child_polygons: [
      [
        [3.35, 6.45],
        [3.355, 6.45],
        [3.355, 6.46],
        [3.35, 6.46],
        [3.35, 6.45],
      ],
      [
        [3.355, 6.45],
        [3.36, 6.45],
        [3.36, 6.46],
        [3.355, 6.46],
        [3.355, 6.45],
      ],
    ],
  });
  console.log("Split into", splitResult.child_parcels.length, "parcels");

  // Get lineage
  const lineage = await geo.getParcelLineage(parcel.id);
  console.log("Lineage entries:", lineage.length);

  // Merge parcels back
  const childIds = splitResult.child_parcels.map((c) => c.id);
  const mergeResult = await geo.mergeParcels({
    parent_parcel_ids: childIds,
    merged_polygon: [
      [3.35, 6.45],
      [3.36, 6.45],
      [3.36, 6.46],
      [3.35, 6.46],
      [3.35, 6.45],
    ],
  });
  console.log("Merged parcel:", mergeResult.merged_parcel.gpid);

  // Get spatial events
  const events = await geo.getSpatialEvents({ limit: 5 });
  console.log(
    "Recent events:",
    events.map((e) => e.event_type)
  );

  // Cluster entities
  const clusters = await geo.runSpatialCluster({
    algorithm: "h3",
    resolution: 7,
  });
  console.log("Clusters found:", clusters.length);

  // Error handling
  try {
    await geo.createParcel({
      property_id: "550e8400-e29b-41d4-a716-446655440099",
      polygon_coordinates: [
        [3.35, 6.45],
        [3.36, 6.46],
        [3.36, 6.45],
        [3.35, 6.46],
        [3.35, 6.45],
      ],
    });
  } catch (err) {
    if (err instanceof XaraValidationError) {
      console.log("Validation error:", err.message, "Reason:", err.reason);
    }
  }
}

main().catch(console.error);
