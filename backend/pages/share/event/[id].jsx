import Head from 'next/head';
import supabase from '../../../db';

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !event) {
      return { notFound: true };
    }

    const frontendUrl = process.env.VITE_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/events/${id}`;

    return {
      props: {
        event,
        redirectUrl,
      },
    };
  } catch (err) {
    console.error('Error fetching event for share:', err);
    return { notFound: true };
  }
}

// Helper to apply cropping parameters for optimal 1.91:1 social previews (1200x630)
function getOptimizedImageUrl(url) {
  if (!url) return 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=630&fit=crop';

  // 1. Handle Unsplash URLs
  if (url.includes('images.unsplash.com')) {
    // Ensure we don't duplicate existing params, but override w, h, and fit
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=630&q=80`;
  }

  // 2. Handle Supabase Storage URLs (using Image Transformation API)
  if (url.includes('.supabase.co/storage/v1/object/public/')) {
    // Transform /object/public/ -> /render/image/public/
    const optimized = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    return `${optimized}?width=1200&height=630&resize=cover`;
  }

  // 3. Fallback for other sources
  return url;
}

export default function ShareEvent({ event, redirectUrl }) {
  const imageUrl = getOptimizedImageUrl(event.image_url);

  return (
    <>
      <Head>
        <title>{event.title}</title>
        <meta name="description" content={event.description} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={redirectUrl} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description} />
        <meta property="og:image" content={imageUrl} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={redirectUrl} />
        <meta property="twitter:title" content={event.title} />
        <meta property="twitter:description" content={event.description} />
        <meta property="twitter:image" content={imageUrl} />

        {/* Redirect for users */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.replace("${redirectUrl}");`,
          }}
        />
      </Head>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>Redirecting to event details...</p>
      </div>
    </>
  );
}
