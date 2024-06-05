import { TPermissionServiceFactory } from "@app/ee/services/permission/permission-service";
import { UnauthorizedError } from "@app/lib/errors";

import { TSecretSharingDALFactory } from "./secret-sharing-dal";
import {
  TCreatePublicSharedSecretDTO,
  TCreateSharedSecretDTO,
  TDeleteSharedSecretDTO,
  TSharedSecretPermission
} from "./secret-sharing-types";

type TSecretSharingServiceFactoryDep = {
  permissionService: Pick<TPermissionServiceFactory, "getOrgPermission">;
  secretSharingDAL: TSecretSharingDALFactory;
};

export type TSecretSharingServiceFactory = ReturnType<typeof secretSharingServiceFactory>;

export const secretSharingServiceFactory = ({
  permissionService,
  secretSharingDAL
}: TSecretSharingServiceFactoryDep) => {
  const createSharedSecret = async (createSharedSecretInput: TCreateSharedSecretDTO) => {
    const {
      actor,
      actorId,
      orgId,
      actorAuthMethod,
      actorOrgId,
      encryptedValue,
      iv,
      tag,
      hashedHex,
      expiresAt,
      expiresAfterViews
    } = createSharedSecretInput;
    const { permission } = await permissionService.getOrgPermission(actor, actorId, orgId, actorAuthMethod, actorOrgId);
    if (!permission) throw new UnauthorizedError({ name: "User not in org" });
    const newSharedSecret = await secretSharingDAL.create({
      encryptedValue,
      iv,
      tag,
      hashedHex,
      expiresAt,
      expiresAfterViews,
      userId: actorId,
      orgId
    });
    return { id: newSharedSecret.id };
  };

  const createPublicSharedSecret = async (createSharedSecretInput: TCreatePublicSharedSecretDTO) => {
    const { encryptedValue, iv, tag, hashedHex, expiresAt, expiresAfterViews } = createSharedSecretInput;
    const newSharedSecret = await secretSharingDAL.create({
      encryptedValue,
      iv,
      tag,
      hashedHex,
      expiresAt,
      expiresAfterViews
    });
    return { id: newSharedSecret.id };
  };

  const getSharedSecrets = async (getSharedSecretsInput: TSharedSecretPermission) => {
    const { actor, actorId, orgId, actorAuthMethod, actorOrgId } = getSharedSecretsInput;
    const { permission } = await permissionService.getOrgPermission(actor, actorId, orgId, actorAuthMethod, actorOrgId);
    if (!permission) throw new UnauthorizedError({ name: "User not in org" });
    const userSharedSecrets = await secretSharingDAL.find({ userId: actorId, orgId }, { sort: [["expiresAt", "asc"]] });
    return userSharedSecrets;
  };

  const getActiveSharedSecretByIdAndHashedHex = async (sharedSecretId: string, hashedHex: string) => {
    const sharedSecret = await secretSharingDAL.findOne({ id: sharedSecretId, hashedHex });
    if (sharedSecret.expiresAt && sharedSecret.expiresAt < new Date()) {
      return;
    }
    if (sharedSecret.expiresAfterViews != null && sharedSecret.expiresAfterViews >= 0) {
      if (sharedSecret.expiresAfterViews === 0) {
        await secretSharingDAL.deleteById(sharedSecretId);
        return;
      }
      await secretSharingDAL.updateById(sharedSecretId, { $decr: { expiresAfterViews: 1 } });
    }
    return sharedSecret;
  };

  const deleteSharedSecretById = async (deleteSharedSecretInput: TDeleteSharedSecretDTO) => {
    const { actor, actorId, orgId, actorAuthMethod, actorOrgId, sharedSecretId } = deleteSharedSecretInput;
    const { permission } = await permissionService.getOrgPermission(actor, actorId, orgId, actorAuthMethod, actorOrgId);
    if (!permission) throw new UnauthorizedError({ name: "User not in org" });
    const deletedSharedSecret = await secretSharingDAL.deleteById(sharedSecretId);
    return deletedSharedSecret;
  };

  return {
    createSharedSecret,
    createPublicSharedSecret,
    getSharedSecrets,
    deleteSharedSecretById,
    getActiveSharedSecretByIdAndHashedHex
  };
};
