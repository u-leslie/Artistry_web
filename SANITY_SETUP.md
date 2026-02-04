# Sanity CMS Setup Guide

This guide will help you set up Sanity CMS so you can manage poems and photos without touching any code!

## 🎯 What You'll Get

- ✅ Add/edit/delete poems instantly
- ✅ Upload and manage photos easily
- ✅ Changes appear on your site automatically
- ✅ Free tier with generous limits
- ✅ Beautiful admin interface

## Step 1: Install Dependencies

First, install the Sanity packages:

```bash
npm install
# or
pnpm install
```

This will install `@sanity/client` and `@sanity/image-url` that are already added to your `package.json`.

## Step 2: Create a Sanity Account & Project

1. Go to [sanity.io](https://www.sanity.io) and sign up (it's free!)
2. Click **"Create new project"**
3. Name it "Artistry CMS" (or anything you like)
4. Choose dataset: **"production"** (default)
5. **Copy your Project ID** - you'll need this next!

## Step 3: Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Create .env file
touch .env
```

Add your Sanity credentials:

```env
VITE_SANITY_PROJECT_ID=your-project-id-here
VITE_SANITY_DATASET=production
```

Replace `your-project-id-here` with the Project ID you copied from Sanity.

## Step 4: Create Content Types in Sanity Studio

You need to create two content types in Sanity. You can do this manually in the Sanity Studio:

### Option A: Use Sanity Studio (Easiest - Recommended)

1. Go to your Sanity Studio: `https://your-project-id.sanity.studio`
   - If you see a 404, you need to deploy the Studio first (see Step 5)

2. Click **"Structure"** in the left sidebar

3. Click **"Create new document type"**

4. **Create "Poem" type:**
   - Name: `poem` (lowercase, exactly)
   - Add these fields:
     - `number` - Type: **String**, Required: ✅
     - `title` - Type: **String**, Required: ✅
     - `content` - Type: **Text**, Required: ✅
     - `order` - Type: **Number**, Required: ✅

5. **Create "Photo" type:**
   - Name: `photo` (lowercase, exactly)
   - Add these fields:
     - `title` - Type: **String**, Required: ✅
     - `number` - Type: **String**, Required: ✅
     - `year` - Type: **String**, Required: ✅
     - `image` - Type: **Image**, Required: ✅
     - `order` - Type: **Number**, Required: ✅

### Option B: Deploy Studio with Schemas (Advanced)

If you want to deploy a Studio with the schemas already configured, see the advanced setup below.

## Step 5: Initialize & Deploy Sanity Studio

If you get a 404 when visiting `https://your-project-id.sanity.studio`, you need to initialize and deploy the Studio:

### Initialize Sanity Project:

```bash
npx sanity@latest init --env
```

Follow the prompts:
- **Select**: "Create new project" or choose your existing project
- **Output path**: Press Enter (uses current directory or creates `sanity` folder)
- **Template**: Choose "Clean project with no predefined schemas" (or any template)
- It will update your `.env` file automatically

### Deploy the Studio:

After initialization, deploy:

```bash
npx sanity@latest deploy
```

**Note**: If you get "Command not available outside of a Sanity project context", make sure you ran `sanity init` first. The init command creates the necessary project structure.

Your Studio will be available at: `https://your-project-id.sanity.studio`

## Step 6: Add Your First Content

1. Go to your Sanity Studio: `https://your-project-id.sanity.studio`

2. **Add a Poem:**
   - Click "Poem" → "Create new"
   - Fill in:
     - Number: `01`
     - Title: `Light in the Shadows`
     - Content: Your poem text (preserves line breaks)
     - Order: `0` (for first poem)
   - Click **"Publish"**

3. **Add a Photo:**
   - Click "Photo" → "Create new"
   - Fill in:
     - Title: `Sky dump`
     - Number: `01`
     - Year: `2025`
     - Image: Upload an image
     - Order: `0`
   - Click **"Publish"**

## Step 7: Test Your Site

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:5173`

3. You should see your poems and photos from Sanity!

## 🎉 You're Done!

Now you can:
- ✅ Add/edit poems in Sanity Studio
- ✅ Upload new photos
- ✅ Reorder content by changing the `order` field
- ✅ All changes appear on your site automatically

## Troubleshooting

### "Error loading poems/photos"
- Check your `.env` file has the correct `VITE_SANITY_PROJECT_ID`
- Make sure you've created the content types (`poem` and `photo`)
- Verify you've published at least one poem/photo

### "Studio not found" (404)
- Deploy the Studio using: `npx sanity@latest deploy`
- Or use the manual content type creation method

### Images not showing
- Make sure you've uploaded images in Sanity Studio
- Check that the `image` field is filled in Photo documents

### Content not updating
- Make sure you clicked **"Publish"** (not just "Save draft")
- The site caches content for 5 minutes - wait or refresh

## Free Tier Limits

Sanity's free tier includes:
- ✅ Unlimited API requests
- ✅ Unlimited documents
- ✅ 10GB asset storage
- ✅ Image optimization
- ✅ Real-time updates

Perfect for personal projects!

## Need Help?

- Sanity Docs: [sanity.io/docs](https://www.sanity.io/docs)
- Sanity Community: [slack.sanity.io](https://slack.sanity.io)
