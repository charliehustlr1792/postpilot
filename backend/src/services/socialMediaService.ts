import { SocialMediaPost } from "../types/post"
import { PublishResult } from "../types/publishResult"



export const publishPostToSocialMedia = async (
    post: SocialMediaPost
): Promise<PublishResult> => {
    //will implement the api calls later
    console.log(`Publishing to ${post.account.platform}:${post.content}`)

    //simulate api call delay
    await new Promise(resolve=>setTimeout(resolve,2000))

    //simulate sucess/failure
    const success =Math.random()>0.1 //90 percent success rate for testing

    if(!success){
        throw new Error(`Failed to publish to ${post.account.platform}`)
    }

    return{
        platformPostId:`${post.account.platform.toLowerCase()}_${Date.now()}`,
        url: `https://${post.account.platform.toLowerCase()}.com/post/123`,
        success:true,
    }
}