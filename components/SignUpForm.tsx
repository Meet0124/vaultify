"use client"

import {useForm} from  "react-hook-form"
import {useSignUp} from "@clerk/nextjs"
import {z} from "zod"

// import schema so that we can use for validation  zod custom schema
import { signUpSchema } from "@/schema/signUpSchema"
import React, { useState } from "react"
import {zodResolver} from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

export default function SignUpForm(){
    const router = useRouter()
    // destructure hook
    const [verifying, setVerifying] = useState(false) 
    const [isSubmitting, setisSubmitting] = useState(false)
    const [verificationCode, setVerificationCode] = useState("")
    const [authError, setAuthError] = useState<string | null>(null)
    const [verificationError, setVerificationError] = useState<string | null>(null)
    const {signUp, isLoaded, setActive} =useSignUp()

    // this will have zod schema validation
    const{
        register,
        handleSubmit,
        formState: {errors},
    }= useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { // default value they have so i dont runon deefault value
            email: "",
            password: "",
            passwordConfirmation:"",
        },
    })

    const onSubmit = async (data: z.infer<typeof signUpSchema>)=> {
        if(!isLoaded) return;
        setisSubmitting(true)
        setAuthError(null)

        try {
            await signUp.create({
                emailAddress: data.email,
                password: data.password
            })
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            })
            setVerifying(true)
        } catch (error: any) {
            console.error("Signup error: ",error)
            setAuthError(
                error.errors?. [0]?.message || "An error occured during signup please try again"  // destructure
            )
        }finally{
            setisSubmitting(false)
        }
    }
// in handle verification we will receive a code so we link upp with classic state to haev some data
    const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>)=> {
        e.preventDefault()
        if(!isLoaded || !signUp) return
        setisSubmitting(true);
        setAuthError(null);

        try {
           const result= await signUp.attemptEmailAddressVerification({
                code: verificationCode
            })
            //todo: console this result
            if(result.status === "complete"){
                // if status is complete and want to create a session
                await setActive({session: result.createdSessionId})
                router.push("/dashboard")

            }else{
                console.error("Verification incomplete",result)
                setVerificationError(
                  "Verification could not be completed"
                );
            }
        } catch (error: any) {
            console.error("Verification incomplete", error);
            setVerificationError(
              error.errors?.[0]?.message ||
                "An error occured during signup please try again"
            );
        }finally{
            setisSubmitting(false) 
        }
    }

    if(verifying){
        return(
            <h1>This is OTP entering field</h1>
        )
    }
    return(
        <h1>SignUp form with email and verification field</h1>
    )
}