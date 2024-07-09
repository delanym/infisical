import { CertKeyAlgorithm } from "../certificates/enums";
import { CaStatus, CaType } from "./enums";

export type TCertificateAuthority = {
  id: string;
  parentCaId?: string;
  projectId: string;
  type: CaType;
  status: CaStatus;
  friendlyName: string;
  organization: string;
  ou: string;
  country: string;
  province: string;
  locality: string;
  commonName: string;
  dn: string;
  maxPathLength?: number;
  notAfter?: string;
  notBefore?: string;
  keyAlgorithm: CertKeyAlgorithm;
  createdAt: string;
  updatedAt: string;
};

export type TCreateCaDTO = {
  projectSlug: string;
  type: string;
  friendlyName?: string;
  organization: string;
  ou: string;
  country: string;
  province: string;
  locality: string;
  commonName: string;
  notAfter?: string;
  maxPathLength: number;
  keyAlgorithm: CertKeyAlgorithm;
};

export type TUpdateCaDTO = {
  projectSlug: string;
  caId: string;
  status?: CaStatus;
};

export type TDeleteCaDTO = {
  projectSlug: string;
  caId: string;
};

export type TSignIntermediateDTO = {
  caId: string;
  csr: string;
  maxPathLength: number;
  notBefore?: string;
  notAfter?: string;
};

export type TSignIntermediateResponse = {
  certificate: string;
  certificateChain: string;
  issuingCaCertificate: string;
  serialNumber: string;
};

export type TImportCaCertificateDTO = {
  caId: string;
  projectSlug: string;
  certificate: string;
  certificateChain: string;
};

export type TImportCaCertificateResponse = {
  message: string;
  caId: string;
};

export type TCreateCertificateDTO = {
  projectSlug: string;
  caId: string;
  friendlyName?: string;
  commonName: string;
  altNames: string; // sans
  ttl: string; // string compatible with ms
  notBefore?: string;
  notAfter?: string;
};

export type TCreateCertificateResponse = {
  certificate: string;
  issuingCertificate: string;
  certificateChain: string;
  privateKey: string;
  serialNumber: string;
};
