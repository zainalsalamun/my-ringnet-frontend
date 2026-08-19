export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type JsonRecord = Record<string, unknown>;
export type RowMapper = (row: JsonRecord) => JsonRecord;

