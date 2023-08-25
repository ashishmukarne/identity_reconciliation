import { Prisma } from '@prisma/client';
import prisma from 'src/prismaClient';

export const contactCTEQuery = (phoneNumber, email): any => {
  return prisma.$queryRaw(Prisma.sql`
    WITH RECURSIVE tree AS
    (
    SELECT
        "id","phoneNumber", "email", "linkPrecedence", "linkedId", "createdAt", "updatedAt"
    FROM "Contact"
    WHERE
        "phoneNumber" = ${phoneNumber} or "email" = ${email}
    UNION
    SELECT
        child."id",child."phoneNumber", child."email", child."linkPrecedence", child."linkedId", child."createdAt", child."updatedAt"
    FROM "Contact" child
        INNER JOIN tree p ON p."phoneNumber" = child."phoneNumber" or p."email" = child."email"
    )
    SELECT
    "id","phoneNumber", "email", "linkPrecedence", "linkedId", "createdAt", "updatedAt"
    FROM tree;`);
};
