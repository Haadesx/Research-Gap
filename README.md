# Research Gap Identifier

This application analyzes uploaded research papers (PDFs) to identify potential research gaps and suggest future research directions using AI.

## Features

*   Upload multiple PDF research papers.
*   Analyzes papers using a large language model (Gemini).
*   Identifies research gaps, limitations, and potential future work based on the provided papers.
*   Displays analysis results in a user-friendly format.
*   Saves analysis history to a Supabase database.
*   Provides a side panel to view past analysis history.
*   User authentication via Google (using Supabase Auth).

## Tech Stack

*   **Backend:** Node.js, Express
*   **Frontend:** HTML, CSS, JavaScript (no framework)
*   **Database:** Supabase (PostgreSQL)
*   **AI Model:** Google Gemini API
*   **Authentication:** Supabase Auth

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Haadesx/Research-Gap.git
    cd Research-Gap
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    *   Create a file named `.env` in the root directory of the project.
    *   Copy the contents of `.env.example` (if it exists) or add the following variables:

    ```dotenv
    # --- Supabase --- 
    SUPABASE_URL="YOUR_SUPABASE_URL"
    SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

    # --- Google Gemini API --- 
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

    # --- Optional: Specify model for analysis ---
    # GEMINI_MODEL="gemini-1.5-flash-latest" # Example

    # --- Port (Optional - defaults to 3000) ---
    # PORT=3000
    ```
    *   Replace `YOUR_SUPABASE_URL`, `YOUR_SUPABASE_ANON_KEY`, and `YOUR_GEMINI_API_KEY` with your actual credentials.

4.  **Set up Supabase Database:**
    *   Ensure you have a Supabase project created.
    *   Create a table named `analysis_history` with the following columns (ensure types match your `server/index.js` code, especially `paper_names` as `text[]` or similar):
        *   `id` (usually auto-generated primary key, bigint or uuid)
        *   `analysis_id` (text, unique)
        *   `user_id` (text, references `auth.users` if needed)
        *   `timestamp` (timestamp with time zone, default now())
        *   `paper_names` (text array - `text[]`)
        *   `analysis_summary` (text)
        *   `full_analysis` (jsonb)
        *   `model_used` (text)
        *   `paper_count` (integer)
        *   `summary_preview` (text)
    *   Configure Row Level Security (RLS) policies on the `analysis_history` table:
        *   Enable RLS for the table.
        *   Create an `INSERT` policy allowing `anon` role to insert (e.g., `USING (true)`).
        *   Create a `SELECT` policy allowing `anon` role to select rows where `user_id` matches the authenticated user's ID (`USING (auth.uid() = user_id::uuid)` - adjust `user_id` cast if needed, or use `USING (true)` for initial testing if authentication mechanism differs).
        *   *Important:* Ensure the `user_id` column in your table matches the type expected by `auth.uid()` if you are using RLS based on authenticated users. For testing without strict auth, you might initially use broader policies.

5.  **Run the application:**
    *   For development (with automatic restarts): `npm run dev`
    *   For production: `npm start`

6.  **Access the application:** Open your web browser and navigate to `http://localhost:3000` (or the port specified in your `.env` file).

## Deployment

This application can be deployed to platforms like Render, Vercel, or Fly.io. Remember to configure the environment variables on the deployment platform instead of committing your `.env` file.

*   **Build Command:** `npm install`
*   **Start Command:** `npm start` (or `node server/index.js`)

## Rate Limits

The application can use multiple AI APIs with different rate limits:

- Google Gemini API:
  - Free tier: 5 requests per minute (RPM), 25 requests per day
- OpenAI API:
  - Requires a paid account with usage-based billing
- Anthropic Claude API:
  - Requires a paid account with usage-based billing

The application implements rate limiting to comply with these restrictions.

## Pricing

The AI APIs have the following pricing structures:

- Google Gemini 2.5 Pro:
  - Input: $1.25 per 1M tokens (≤200K tokens), $2.50 per 1M tokens (>200K tokens)
  - Output: $10.00 per 1M tokens (≤200K tokens), $15.00 per 1M tokens (>200K tokens)
  
- OpenAI GPT-4o:
  - Input: $5.00 per 1M tokens
  - Output: $15.00 per 1M tokens
  
- Anthropic Claude 3 Opus:
  - Input: $15.00 per 1M tokens
  - Output: $75.00 per 1M tokens

## Usage

1. Sign in with your Google account
2. Upload your research papers (PDF, TXT files are recommended)
3. Click "Analyze Papers" to process the papers
4. View the identified research gaps and recommendations

## How It Works

1. The user uploads research papers through the interface
2. The application extracts text from the uploaded files
3. The text is sent to Google's Gemini 2.5 Pro API for analysis
4. The API identifies research gaps by analyzing the content of the papers
5. The results are displayed to the user in a structured format
6. Users can then chat with the AI assistant about the papers using multiple AI models in a fallback sequence

## Lessons Learned

- Implementing PDF text extraction using PDF.js
- Working with multiple AI APIs (Google Gemini, OpenAI, and Anthropic Claude)
- Handling file uploads and processing in Node.js
- Implementing Google OAuth authentication with Passport.js
- Managing API rate limits and quota restrictions

## Future Improvements

- Support for more document formats
- Enhanced analysis with customizable parameters
- User accounts with saved analyses
- Batch processing of large document sets
- Export functionality for analysis results

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google for providing the Gemini API
- OpenAI for providing the GPT API
- Anthropic for providing the Claude API
- Mozilla for the PDF.js library
- The Node.js and Express.js communities 