import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Product {
  id: string
  product_name: string
  widget_url: string
}

export default function WidgetCodeDisplay({
  userId,
  customerId,
}: {
  userId: string
  customerId: string
}) {
  const [copied, setCopied] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch widget URL on mount
  useEffect(() => {
    const fetchWidgetCode = async () => {
      if (!userId) {
        setError('User ID not found')
        setLoading(false)
        return
      }

      try {
        const { data, error: queryError } = await supabase
          .from('user_products')
          .select(`
            id,
            product_name,
            widget_url
          `)
          .eq('user_id', userId)
          .maybeSingle()

        if (queryError) {
          console.error('Error fetching widget code:', queryError)
          setError(`Could not load widget code: ${queryError.message}`)
          return
        }

        if (data) {
          setProduct(data)
        } else {
          setError('No product found for this user')
        }
      } catch (err: any) {
        console.error('Error:', err)
        setError(`Error: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchWidgetCode()
  }, [userId])

  // Generate the full widget code
  const generateWidgetCode = () => {
    if (!product) return ''

    return `<!-- Monumentum AI Agent Widget -->
<script src="${product.widget_url}"></script>
<script>
  MonumentumChat.init({
    customerId: '${customerId}',
    primaryColor: '#0066cc',
    position: 'bottom-right'
  });
</script>`
  }

  const widgetCode = generateWidgetCode()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(widgetCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading widget code...</div>
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>
  }

  if (!product) {
    return <div className="p-4 text-gray-500">No product found.</div>
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">📝 Widget Installation Code</h3>
        <p className="text-gray-600 mb-4">
          Copy this code and paste it on your website before the closing <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag.
        </p>
      </div>

      {/* Code Block */}
      <div className="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
        <pre className="text-gray-100 text-sm font-mono whitespace-pre-wrap break-words">
{widgetCode}
        </pre>
      </div>

      {/* Copy Button */}
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {copied ? (
            <>
              <Check size={18} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={18} />
              Copy Code
            </>
          )}
        </button>
      </div>

      {/* Customer ID Reference */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Your Customer ID:</strong>{' '}
          <code className="bg-white px-2 py-1 rounded font-mono text-blue-600">
            {customerId}
          </code>
        </p>
      </div>

      {/* Installation Instructions */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">📖 Installation steps:</p>
        <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
          <li>Click "Copy Code" above</li>
          <li>Go to your website's HTML</li>
          <li>Find the closing <code className="bg-white px-1 rounded">&lt;/body&gt;</code> tag</li>
          <li>Paste the code just before it</li>
          <li>Save and refresh your site</li>
          <li>The chat widget will appear in the bottom-right corner</li>
        </ol>
      </div>

      {/* Help Section */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
          💡 <strong>Need help?</strong> Visit our{' '}
          <a href="https://monumentum.ai/docs/installation" className="text-blue-600 hover:underline">
            installation guide
          </a>{' '}
          or email{' '}
          <a href="mailto:support@monumentum.ai" className="text-blue-600 hover:underline">
            support@monumentum.ai
          </a>
        </p>
      </div>
    </div>
  )
}
