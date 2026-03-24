export interface XaraGeoClientConfig {
  baseUrl: string;
  tenantId: string;
  apiKey: string;
  timeout?: number;
}

export interface SpatialEntity {
  id: string;
  tenant_id: string;
  entity_type: string;
  entity_id: string;
  latitude: number;
  longitude: number;
  geohash: string;
  h3_index: string;
  created_at: string;
}

export interface CreateSpatialEntityParams {
  entity_type: string;
  entity_id: string;
  latitude: number;
  longitude: number;
}

export interface NearbySearchParams {
  lat: number;
  lon: number;
  radius: number;
  entity_type?: string;
}

export interface PolygonSearchParams {
  polygon: number[][];
  entity_type?: string;
}

export interface Parcel {
  id: string;
  tenant_id: string;
  property_id: string;
  gpid: string;
  status: string;
  geohash: string;
  h3_index: string;
  area_sq_m: number;
  spatial_hash: string;
  created_at: string;
}

export interface CreateParcelParams {
  property_id: string;
  polygon_coordinates: number[][];
}

export interface CheckParcelOverlapParams {
  polygon_coordinates: number[][];
}

export interface ParcelVersion {
  id: string;
  parcel_id: string;
  version_number: number;
  geometry_hash: string | null;
  valid_from: string;
  valid_to: string | null;
  created_at: string;
}

export interface CreateParcelVersionParams {
  polygon_coordinates: number[][];
}

export interface ParcelSplitParams {
  child_polygons: number[][][];
}

export interface ParcelSplitResult {
  parent_parcel_id: string;
  child_parcels: Parcel[];
  event_type: string;
}

export interface ParcelMergeParams {
  parent_parcel_ids: string[];
  merged_polygon: number[][];
}

export interface ParcelMergeResult {
  merged_parcel: Parcel;
  parent_parcel_ids: string[];
  event_type: string;
}

export interface ParcelLineageEntry {
  id: string;
  parent_parcel_id: string;
  child_parcel_id: string;
  event_type: string;
  created_at: string;
  parent_gpid: string;
  child_gpid: string;
}

export interface SpatialEvent {
  id: string;
  tenant_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface GetSpatialEventsParams {
  event_type?: string;
  limit?: number;
}

export interface H3StatsParams {
  h3_index: string;
  metric_type?: string;
}

export interface H3Stat {
  id: string;
  tenant_id: string;
  h3_index: string;
  metric_type: string;
  metric_value: number;
  metric_timestamp: string;
}

export interface ClusterParams {
  algorithm: "dbscan" | "kmeans" | "h3";
  entity_type?: string;
  epsilon?: number;
  min_points?: number;
  k?: number;
  resolution?: number;
}

export interface ClusterResult {
  cluster_id: number;
  centroid_lat: number;
  centroid_lon: number;
  point_count: number;
  points: Array<{
    id?: string;
    latitude?: number;
    longitude?: number;
    entity_type?: string;
  }>;
}

export interface HealthStatus {
  status: string;
}

export interface XaraApiError {
  error: string;
  reason?: string;
}
