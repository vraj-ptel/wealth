import { currentUser } from "@clerk/nextjs/server";

import React from "react";
import prisma from "./prisma";

const checkUser = async () => {
  try {
    const user = await currentUser();
  if (!user) {
    return null;
  } else {
    const loggedUser = await prisma.user.findUnique({
      where: { clearkUserId: user.id },
    });
    if (!loggedUser) {
      const newUser = await prisma.user.create({
        data: {
          clearkUserId: user.id,
          email: user.emailAddresses[0].emailAddress,
          name:`${user.firstName}-${user.lastName}`,
          imageUrl:user.imageUrl,

        },
      });
      return newUser;
    }
  }
  } catch (error) {
    console.log('error',error);
  }
};

export default checkUser;
