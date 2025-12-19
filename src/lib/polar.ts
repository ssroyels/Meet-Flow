import {Polar} from "@polar-sh/sdk";

console.log(process.env.POLAR_ACCESS_TOKEN?.startsWith("polar_pat_"));

export const polarClient = new Polar({
    accessToken:process.env.POLAR_ACCESS_TOKEN,
    server:"sandbox"
})