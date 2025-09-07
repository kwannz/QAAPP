export interface ApiVersion {
    version: string;
    deprecated?: boolean;
    sunsetDate?: Date;
}
export interface VersionedEndpoint {
    path: string;
    versions: ApiVersion[];
}
