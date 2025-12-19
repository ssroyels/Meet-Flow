import { auth } from '@/lib/auth';
import { SignUpView } from '@/modules/auth/ui/views/sign-up-view';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react'

const Page = async () => {
   const session = auth.api.getSession({
          headers:await headers(),
      })
  
      if(!!session) {
          redirect("/")
      }
  return (
    <SignUpView/>
   
  )
}

export default Page;
