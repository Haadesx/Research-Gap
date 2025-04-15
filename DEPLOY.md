# Deploying the Research Gap Identifier to Vercel

This guide provides step-by-step instructions for deploying the Research Gap Identifier application to Vercel for free hosting.

## Prerequisites

- A [GitHub](https://github.com/) account
- A [Vercel](https://vercel.com/) account (you can sign up with your GitHub account)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Step 1: Prepare Your Repository

1. Push your code to a GitHub repository:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/research-gap-identifier.git
   git push -u origin main
   ```

## Step 2: Connect to Vercel

1. Log in to [Vercel](https://vercel.com/).
2. Click on "Add New" > "Project".
3. Connect to your GitHub account if you haven't already.
4. Select the repository containing your Research Gap Identifier code.
5. Vercel will automatically detect that it's a Node.js project.

## Step 3: Configure Environment Variables

1. In the Vercel project configuration page, go to the "Environment Variables" section.
2. Add your environment variables:
   - Name: `GEMINI_API_KEY`
   - Value: Your Google Gemini API key
3. If you need any other environment variables, add them here as well.

## Step 4: Deploy

1. Click "Deploy" to start the deployment process.
2. Vercel will build and deploy your application.
3. Once the deployment is complete, Vercel will provide you with a URL to access your application.

## Step 5: Verify Deployment

1. Visit the provided URL to verify that your application is working correctly.
2. Test the file upload and analysis functionality.
3. Check for any errors in the Vercel deployment logs.

## Troubleshooting

If you encounter issues with your deployment, check the following:

1. **Build Errors**: Check the build logs in Vercel for any errors.
2. **Environment Variables**: Ensure your API key is correctly set in the environment variables.
3. **API Limitations**: Be aware of any rate limits or quota restrictions on your Gemini API key.

## Custom Domain (Optional)

If you want to use a custom domain:

1. Go to your project settings in Vercel.
2. Navigate to the "Domains" section.
3. Add your custom domain and follow the instructions to configure DNS settings.

## Automatic Deployments

Vercel automatically deploys your application when you push changes to your GitHub repository. No additional setup is needed for continuous deployment.

## Conclusion

Your Research Gap Identifier application should now be successfully deployed on Vercel and accessible worldwide. Any updates you push to your GitHub repository will be automatically deployed. 