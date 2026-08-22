/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export type DatatablePayload = {
  pageSize?: number;
  pageIndex?: number;
  sorting?: Array<{ id: string; desc: boolean }>;
  columnFilters?: Array<{ id: string; value: unknown }>;
  globalFilter?: string;
  [key: string]: any;
};

export const partnerApi = {
  // 1. Pelanggan (Residential)
  customers: {
    list(payload: DatatablePayload = { pageSize: 15, pageIndex: 0 }) {
      return api.post(API_ENDPOINTS.partnerApi.customersList, payload);
    },
    listStatus() {
      return api.get(API_ENDPOINTS.partnerApi.customersListStatus);
    },
    read(customerId: string) {
      return api.get(API_ENDPOINTS.partnerApi.customerRead(customerId));
    },
    create(payload: FormData | Record<string, any>) {
      const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
      return api.post(API_ENDPOINTS.partnerApi.customerCreate, payload, { headers });
    },
    update(payload: FormData | Record<string, any>) {
      const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
      return api.patch(API_ENDPOINTS.partnerApi.customerUpdate, payload, { headers });
    },
    remove(customerId: string) {
      return api.delete(API_ENDPOINTS.partnerApi.customerDelete(customerId));
    },
    changeStatus(id: string, status?: boolean) {
      return api.patch(API_ENDPOINTS.partnerApi.customerChangeStatus, { id, status });
    },
  },

  // 2. Pelanggan Bisnis (Corporate & Enterprise)
  business: {
    list(payload: DatatablePayload = { pageSize: 15, pageIndex: 0 }) {
      return api.post(API_ENDPOINTS.partnerApi.businessList, payload);
    },
    listStatus() {
      return api.get(API_ENDPOINTS.partnerApi.businessListStatus);
    },
    read(id: string) {
      return api.get(API_ENDPOINTS.partnerApi.businessRead(id));
    },
    create(payload: FormData | Record<string, any>) {
      const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
      return api.post(API_ENDPOINTS.partnerApi.businessCreate, payload, { headers });
    },
    update(payload: FormData | Record<string, any>) {
      const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
      return api.patch(API_ENDPOINTS.partnerApi.businessUpdate, payload, { headers });
    },
    remove(id: string) {
      return api.delete(API_ENDPOINTS.partnerApi.businessDelete(id));
    },
    changeStatus(id: string, status?: boolean) {
      return api.patch(API_ENDPOINTS.partnerApi.businessChangeStatus, { id, status });
    },
  },

  // 3. Legal & Profil POP
  partners: {
    profile() {
      return api.get(API_ENDPOINTS.partnerApi.profile);
    },
    read(partnerId: string) {
      return api.get(API_ENDPOINTS.partnerApi.partnerRead(partnerId));
    },
    documents() {
      return api.get(API_ENDPOINTS.partnerApi.documents);
    },
    documentUrl(filename: string) {
      return API_ENDPOINTS.partnerApi.documentFile(filename);
    },
  },

  // 4 & 5. Perangkat Jaringan (Aktif & Pasif - OLT, Router, Switch, ODC, ODP, OTB)
  networkDevices: {
    list(payload: DatatablePayload = { pageSize: 15, pageIndex: 0 }) {
      return api.post(API_ENDPOINTS.partnerApi.networkDevicesList, payload);
    },
    stats() {
      return api.get(API_ENDPOINTS.partnerApi.networkDevicesStats);
    },
    read(deviceId: string) {
      return api.get(API_ENDPOINTS.partnerApi.networkDeviceRead(deviceId));
    },
    create(payload: Record<string, any>) {
      return api.post(API_ENDPOINTS.partnerApi.networkDeviceCreate, payload);
    },
    update(deviceId: string, payload: Record<string, any>) {
      return api.patch(API_ENDPOINTS.partnerApi.networkDeviceUpdate(deviceId), payload);
    },
    remove(deviceId: string) {
      return api.delete(API_ENDPOINTS.partnerApi.networkDeviceDelete(deviceId));
    },
  },

  // 6. Map Infrastruktur
  map: {
    markers(types?: string) {
      return api.get(API_ENDPOINTS.partnerApi.mapMarkers(types));
    },
    markerTypes() {
      return api.get(API_ENDPOINTS.partnerApi.mapMarkerTypes);
    },
    nodeRead(id: string) {
      return api.get(API_ENDPOINTS.partnerApi.mapNodeRead(id));
    },
    nodeReport(id: string) {
      return api.get(API_ENDPOINTS.partnerApi.mapNodeReport(id));
    },
    cablesList(params?: string) {
      return api.get(API_ENDPOINTS.partnerApi.mapCablesList(params));
    },
    cableCoreCapacities() {
      return api.get(API_ENDPOINTS.partnerApi.mapCableCoreCapacities);
    },
    cableRead(id: string) {
      return api.get(API_ENDPOINTS.partnerApi.mapCableRead(id));
    },
    splicesByCable(id: string) {
      return api.get(API_ENDPOINTS.partnerApi.mapSplicesByCable(id));
    },
    splicesByNode(id: string) {
      return api.get(API_ENDPOINTS.partnerApi.mapSplicesByNode(id));
    },
    nodeTopology(id: string) {
      return api.get(API_ENDPOINTS.partnerApi.mapNodeTopology(id));
    },
  },

  // 7. RADIUS (Akun, Sesi, Log, Profil Bandwidth)
  radius: {
    usersList(payload: DatatablePayload = { pageSize: 15, pageIndex: 0 }) {
      return api.post(API_ENDPOINTS.partnerApi.radiusUsersList, payload);
    },
    usersListStatus() {
      return api.get(API_ENDPOINTS.partnerApi.radiusUsersListStatus);
    },
    userRead(id: string) {
      return api.get(API_ENDPOINTS.partnerApi.radiusUserRead(id));
    },
    userCreate(payload: Record<string, any>) {
      return api.post(API_ENDPOINTS.partnerApi.radiusUserCreate, payload);
    },
    userUpdate(id: string, payload: Record<string, any>) {
      return api.patch(API_ENDPOINTS.partnerApi.radiusUserUpdate(id), payload);
    },
    userDelete(id: string) {
      return api.delete(API_ENDPOINTS.partnerApi.radiusUserDelete(id));
    },
    userChangeStatus(payload: { id: string; status?: boolean }) {
      return api.patch(API_ENDPOINTS.partnerApi.radiusUserChangeStatus, payload);
    },
    sessionsList(payload: DatatablePayload = { pageSize: 15, pageIndex: 0 }) {
      return api.post(API_ENDPOINTS.partnerApi.radiusSessionsList, payload);
    },
    sessionDisconnect(payload: { username?: string; nas_ip?: string; session_id?: string; [key: string]: any }) {
      return api.post(API_ENDPOINTS.partnerApi.radiusSessionDisconnect, payload);
    },
    logsList(id: string, payload: DatatablePayload = { pageSize: 15, pageIndex: 0 }) {
      return api.post(API_ENDPOINTS.partnerApi.radiusLogsList(id), payload);
    },
    profilesList(payload: DatatablePayload = { pageSize: 15, pageIndex: 0 }) {
      return api.post(API_ENDPOINTS.partnerApi.radiusProfilesList, payload);
    },
    profilesSelect(payload: Record<string, any> = {}) {
      return api.post(API_ENDPOINTS.partnerApi.radiusProfilesSelect, payload);
    },
    profileRead(id: string) {
      return api.get(API_ENDPOINTS.partnerApi.radiusProfileRead(id));
    },
    profileCreate(payload: Record<string, any>) {
      return api.post(API_ENDPOINTS.partnerApi.radiusProfileCreate, payload);
    },
    profileUpdate(payload: Record<string, any>) {
      return api.patch(API_ENDPOINTS.partnerApi.radiusProfileUpdate, payload);
    },
    profileUpdateBatch(payload: { profiles: Array<Record<string, any>> }) {
      return api.patch(API_ENDPOINTS.partnerApi.radiusProfileUpdateBatch, payload);
    },
    profileDelete(id: string) {
      return api.delete(API_ENDPOINTS.partnerApi.radiusProfileDelete(id));
    },
  },

  // 8. Products (Broadband)
  products: {
    broadbandList(payload: DatatablePayload = { pageSize: 15, pageIndex: 0 }) {
      return api.post(API_ENDPOINTS.partnerApi.productsBroadbandList, payload);
    },
    broadbandRead(id: string) {
      return api.get(API_ENDPOINTS.partnerApi.productsBroadbandRead(id));
    },
    broadbandCreate(payload: Record<string, any>) {
      return api.post(API_ENDPOINTS.partnerApi.productsBroadbandCreate, payload);
    },
    broadbandUpdate(id: string, payload: Record<string, any>) {
      return api.patch(API_ENDPOINTS.partnerApi.productsBroadbandUpdate(id), payload);
    },
    broadbandDelete(id: string) {
      return api.delete(API_ENDPOINTS.partnerApi.productsBroadbandDelete(id));
    },
  },
};
