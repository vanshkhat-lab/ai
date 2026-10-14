import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { api, getErrorMessage, getImageUrl } from './api'
import './App.css'

const TOKEN_KEY = 'sports-store-token'

function App() {
  return (
    <BrowserRouter>
      <StoreApp />
    </BrowserRouter>
  )
}

function StoreApp() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(Boolean(token))
  const [authError, setAuthError] = useState('')
  const [authAttempt, setAuthAttempt] = useState(0)

  useEffect(() => {
    if (!token) {
      setUser(null)
      setAuthLoading(false)
      return
    }

    let cancelled = false
    api
      .get('/api/auth/me')
      .then(({ data }) => {
        if (!cancelled) {
          setUser(data.data)
          setAuthError('')
        }
      })
      .catch((error) => {
        if (!cancelled) {
          if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY)
            setToken(null)
            setUser(null)
            setAuthError('')
          } else {
            setAuthError(getErrorMessage(error))
          }
        }
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, authAttempt])

  const signIn = (result) => {
    localStorage.setItem(TOKEN_KEY, result.token)
    setToken(result.token)
    setUser(result.user)
  }

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <div className="app-shell">
      <Header user={user} onSignOut={signOut} />
      <main className="page-content">
        {authLoading ? (
          <div className="page-state" role="status">
            <span className="spinner" />
            Restoring your session…
          </div>
        ) : authError ? (
          <ErrorState
            message={authError}
            onRetry={() => {
              setAuthLoading(true)
              setAuthAttempt((attempt) => attempt + 1)
            }}
          />
        ) : (
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route
              path="/register"
              element={user ? <Navigate to="/" replace /> : <AuthPage mode="register" onSignIn={signIn} />}
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <AuthPage mode="login" onSignIn={signIn} />}
            />
            <Route path="/items/:itemId" element={<ItemPage user={user} />} />
            <Route
              path="/checkout/:itemId"
              element={
                <RequireAuth user={user}>
                  <CheckoutPage />
                </RequireAuth>
              }
            />
            <Route
              path="/orders"
              element={
                <RequireAuth user={user}>
                  <OrdersPage />
                </RequireAuth>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <RequireAuth user={user}>
                  <OrderDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAuth user={user} adminOnly>
                  <AdminPage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        )}
      </main>
      <Footer />
    </div>
  )
}

function Header({ user, onSignOut }) {
  const navigate = useNavigate()

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="Baseline home">
          <span className="brand-mark" aria-hidden="true">B</span>
          <span>baseline<span className="brand-period">.</span></span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link to="/">Shop</Link>
          {user && <Link to="/orders">My orders</Link>}
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <span className="user-greeting">Hi, {user.name.split(' ')[0]}</span>
              <button
                className="button button-quiet button-small"
                type="button"
                onClick={() => {
                  onSignOut()
                  navigate('/')
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="button button-quiet button-small" to="/login">Sign in</Link>
              <Link className="button button-dark button-small" to="/register">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <Link className="brand footer-brand" to="/">
        <span className="brand-mark" aria-hidden="true">B</span>
        <span>baseline<span className="brand-period">.</span></span>
      </Link>
      <span>Gear up. Get out there.</span>
      <span>© {new Date().getFullYear()} Baseline Sports</span>
    </footer>
  )
}

function RequireAuth({ user, adminOnly = false, children }) {
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function CatalogPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All gear')

  useEffect(() => {
    let cancelled = false
    api
      .get('/api/items')
      .then(({ data }) => {
        if (!cancelled) setItems(data.data)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(
    () => ['All gear', ...new Set(items.map((item) => item.category).filter(Boolean))],
    [items],
  )
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesCategory = category === 'All gear' || item.category === category
      const matchesQuery =
        !normalizedQuery ||
        `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(normalizedQuery)
      return matchesCategory && matchesQuery
    })
  }, [items, query, category])

  return (
    <>
      <section className="hero-banner">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> EQUIPMENT FOR EVERY DAY</span>
          <h1>Find your<br /><span>next gear.</span></h1>
          <p>Good kit makes the difference. Discover equipment picked for every session, every field, every goal.</p>
          <a className="button button-lime" href="#shop">Explore the collection <span aria-hidden="true">↘</span></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-ball"><span /></div>
          <span className="hero-art-label">PLAY<br />YOUR<br />WAY.</span>
          <span className="hero-art-index">01 / 04</span>
        </div>
        <div className="hero-meta"><span>BUILT FOR MOVEMENT</span><span>EST. FOR THE GAME <b>✳</b></span></div>
      </section>

      <section className="shop-section" id="shop">
        <div className="section-heading">
          <div>
            <span className="eyebrow eyebrow-muted">THE COLLECTION</span>
            <h2>Shop the gear<span className="brand-period">.</span></h2>
          </div>
          <p>Everything you need to show up and play.</p>
        </div>

        <div className="catalog-controls">
          <div className="category-tabs" aria-label="Filter by category">
            {categories.map((value) => (
              <button
                className={`category-tab${category === value ? ' is-active' : ''}`}
                key={value}
                type="button"
                onClick={() => setCategory(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <label className="search-field">
            <span className="sr-only">Search gear</span>
            <SearchIcon />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find something…" />
          </label>
        </div>

        {loading ? (
          <div className="page-state" role="status"><span className="spinner" />Loading the collection…</div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : filteredItems.length ? (
          <div className="product-grid">
            {filteredItems.map((item, index) => <ProductCard item={item} index={index} key={item._id} />)}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">⌕</span>
            <h3>{items.length ? 'No gear found' : 'Your collection is warming up'}</h3>
            <p>{items.length ? 'Try a different search or category.' : 'There are no items available right now. Please check back soon.'}</p>
            {items.length > 0 && <button className="button button-quiet" onClick={() => { setQuery(''); setCategory('All gear') }} type="button">Clear filters</button>}
          </div>
        )}
      </section>
      <section className="manifesto">
        <span>NO SHORTCUTS. JUST SHOW UP.</span>
        <p>Made for the early starts, the extra reps, and the love of the game.</p>
        <span className="manifesto-star" aria-hidden="true">✳</span>
      </section>
    </>
  )
}

function ProductCard({ item, index }) {
  return (
    <article className="product-card">
      <Link className={`product-visual product-tone-${index % 4}`} to={`/items/${item._id}`} aria-label={`View ${item.name}`}>
        <ProductImage src={item.image} alt={item.name} loading="lazy" />
        <span className="product-category">{item.category || 'General'}</span>
        <span className="product-open" aria-hidden="true">↗</span>
      </Link>
      <div className="product-info">
        <div>
          <Link className="product-name" to={`/items/${item._id}`}>{item.name}</Link>
          <span className={`stock-label${item.stock === 0 ? ' is-out' : ''}`}>
            {item.stock === 0 ? 'Out of stock' : `${item.stock} in stock`}
          </span>
        </div>
        <span className="product-price">{formatPrice(item.price)}</span>
      </div>
    </article>
  )
}

function ItemPage({ user }) {
  const { itemId } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .get(`/api/items/${itemId}`)
      .then(({ data }) => {
        if (!cancelled) setItem(data.data)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [itemId])

  if (loading) return <div className="page-state"><span className="spinner" />Loading item…</div>
  if (error) return <ErrorState message={error} />

  return (
    <section className="detail-page">
      <Link className="back-link" to="/">← Back to shop</Link>
      <div className="detail-layout">
        <div className="detail-image">
          <ProductImage src={item.image} alt={item.name} />
        </div>
        <div className="detail-copy">
          <span className="eyebrow eyebrow-muted">{item.category || 'GENERAL'} / ITEM DETAILS</span>
          <h1>{item.name}</h1>
          <p className="detail-price">{formatPrice(item.price)}</p>
          <p className="detail-description">{item.description}</p>
          <p className={`detail-stock${item.stock === 0 ? ' is-out' : ''}`}>
            <span className="eyebrow-dot" />{item.stock === 0 ? 'Currently unavailable' : `In stock · ${item.stock} available`}
          </p>
          {item.stock > 0 ? (
            user ? (
              <Link className="button button-dark button-wide" to={`/checkout/${item._id}`}>Continue to checkout <span>→</span></Link>
            ) : (
              <Link className="button button-dark button-wide" to="/login" state={{ from: { pathname: `/checkout/${item._id}` } }}>Sign in to order <span>→</span></Link>
            )
          ) : (
            <button className="button button-dark button-wide" disabled type="button">Out of stock</button>
          )}
          <div className="detail-note"><span>✳</span><p>Secure checkout with your account. Your order is saved to your order history.</p></div>
        </div>
      </div>
    </section>
  )
}

function AuthPage({ mode, onSignIn }) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '', adminSecret: '' })
  const [createAdmin, setCreateAdmin] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
      const body = isRegister
        ? {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            ...(createAdmin ? { role: 'admin', adminSecret: form.adminSecret } : {}),
          }
        : { email: form.email.trim(), password: form.password }
      const { data } = await api.post(endpoint, body)
      onSignIn(data.data)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-aside">
        <span className="eyebrow"><span className="eyebrow-dot" /> THE GAME STARTS HERE</span>
        <h1>{isRegister ? <>Make room<br />for <span>more.</span></> : <>Good to<br /><span>see you.</span></>}</h1>
        <p>{isRegister ? 'Create your account and get straight to the good stuff.' : 'Pick up where you left off. Your next session is waiting.'}</p>
        <div className="auth-aside-mark">B<span>.</span></div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-heading">
          <span className="eyebrow eyebrow-muted">{isRegister ? 'JOIN THE CLUB' : 'WELCOME BACK'}</span>
          <h2>{isRegister ? 'Create your account' : 'Sign in to Baseline'}</h2>
          <p>{isRegister ? 'A few details and you’re in.' : 'Enter your details to sign in.'}</p>
        </div>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <form className="form-stack" onSubmit={submit}>
          {isRegister && (
            <label className="form-field">
              <span>Full name</span>
              <input autoComplete="name" name="name" onChange={update} placeholder="Alex Morgan" required value={form.name} />
            </label>
          )}
          <label className="form-field">
            <span>Email address</span>
            <input autoComplete="email" name="email" onChange={update} placeholder="you@example.com" required type="email" value={form.email} />
          </label>
          <label className="form-field">
            <span>Password <small>{isRegister && '· at least 6 characters'}</small></span>
            <input autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 6 : undefined} name="password" onChange={update} placeholder="Enter your password" required type="password" value={form.password} />
          </label>
          {isRegister && (
            <div className="admin-signup">
              <label className="check-field">
                <input checked={createAdmin} onChange={(event) => setCreateAdmin(event.target.checked)} type="checkbox" />
                <span>Create an administrator account</span>
              </label>
              {createAdmin && (
                <label className="form-field admin-secret-field">
                  <span>Administrator secret</span>
                  <input autoComplete="off" name="adminSecret" onChange={update} required type="password" value={form.adminSecret} />
                  <small>Only accounts with a valid server secret receive admin access.</small>
                </label>
              )}
            </div>
          )}
          <button className="button button-dark button-wide form-submit" disabled={busy} type="submit">
            {busy ? <><span className="spinner spinner-light" />{isRegister ? 'Creating account…' : 'Signing in…'}</> : <>{isRegister ? 'Create account' : 'Sign in'} <span>→</span></>}
          </button>
        </form>
        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : 'New to Baseline?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link>
        </p>
      </div>
    </section>
  )
}

function CheckoutPage() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [address, setAddress] = useState({ street: '', city: '', zipCode: '' })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .get(`/api/items/${itemId}`)
      .then(({ data }) => {
        if (!cancelled) setItem(data.data)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [itemId])

  const placeOrder = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post('/api/orders', {
        itemId,
        quantity,
        shippingAddress: address,
      })
      navigate(`/orders/${data.data._id}`, { replace: true, state: { justPlaced: true } })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="page-state"><span className="spinner" />Preparing checkout…</div>
  if (!item) return <ErrorState message={error || 'This item could not be found.'} />

  return (
    <section className="checkout-page">
      <Link className="back-link" to={`/items/${itemId}`}>← Back to item</Link>
      <div className="checkout-heading">
        <span className="eyebrow eyebrow-muted">ONE LAST STEP</span>
        <h1>Make it yours<span className="brand-period">.</span></h1>
        <p>Confirm your order and where you’d like it delivered.</p>
      </div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={placeOrder}>
          <div className="checkout-block">
            <span className="step-index">01</span>
            <div className="checkout-block-content">
              <h2>Shipping address</h2>
              <p>Where should we send your gear?</p>
              <div className="form-stack">
                <label className="form-field"><span>Street address</span><input autoComplete="street-address" onChange={(event) => setAddress({ ...address, street: event.target.value })} placeholder="123 Main Street" required value={address.street} /></label>
                <div className="field-row">
                  <label className="form-field"><span>City</span><input autoComplete="address-level2" onChange={(event) => setAddress({ ...address, city: event.target.value })} placeholder="Mumbai" required value={address.city} /></label>
                  <label className="form-field"><span>ZIP / postal code</span><input autoComplete="postal-code" onChange={(event) => setAddress({ ...address, zipCode: event.target.value })} placeholder="400001" required value={address.zipCode} /></label>
                </div>
              </div>
            </div>
          </div>
          <div className="checkout-block">
            <span className="step-index">02</span>
            <div className="checkout-block-content">
              <h2>Quantity</h2>
              <p>{item.stock} available</p>
              <div className="quantity-picker">
                <button aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => value - 1)} type="button">−</button>
                <span aria-live="polite">{quantity}</span>
                <button aria-label="Increase quantity" disabled={quantity >= item.stock} onClick={() => setQuantity((value) => value + 1)} type="button">+</button>
              </div>
            </div>
          </div>
          <button className="button button-dark button-wide checkout-submit" disabled={busy || item.stock < 1} type="submit">
            {busy ? <><span className="spinner spinner-light" />Placing your order…</> : <>Place order <span>→</span></>}
          </button>
        </form>
        <aside className="order-summary">
          <span className="eyebrow eyebrow-muted">YOUR ORDER</span>
          <div className="summary-item">
            <div className="summary-image"><ProductImage src={item.image} alt={item.name} /></div>
            <div><strong>{item.name}</strong><span>{item.category || 'General'} · Qty {quantity}</span></div>
          </div>
          <div className="summary-line"><span>Subtotal</span><span>{formatPrice(item.price * quantity)}</span></div>
          <div className="summary-line"><span>Shipping</span><span className="free-shipping">On us</span></div>
          <div className="summary-total"><span>Total</span><strong>{formatPrice(item.price * quantity)}</strong></div>
          <p className="summary-footnote">Final stock is verified when the order is submitted.</p>
        </aside>
      </div>
    </section>
  )
}

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    let cancelled = false
    api
      .get('/api/orders/my-orders')
      .then(({ data }) => { if (!cancelled) setOrders(data.data) })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [refresh])

  return (
    <section className="orders-page">
      <div className="orders-heading">
        <div><span className="eyebrow eyebrow-muted">YOUR BASELINE ACCOUNT</span><h1>Order history<span className="brand-period">.</span></h1></div>
        <Link className="button button-dark" to="/">Back to shop <span>→</span></Link>
      </div>
      {loading ? <div className="page-state"><span className="spinner" />Loading your orders…</div> :
        error ? <ErrorState message={error} onRetry={() => { setError(''); setLoading(true); setRefresh((value) => value + 1) }} /> :
          orders.length === 0 ? (
            <div className="empty-state orders-empty"><span className="empty-icon">↗</span><h3>Nothing on the books yet</h3><p>Your orders will show up here once you find the right gear.</p><Link className="button button-dark" to="/">Explore the collection <span>→</span></Link></div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => <OrderRow key={order._id} order={order} />)}
            </div>
          )}
    </section>
  )
}

function OrderRow({ order, admin = false }) {
  const item = order.item
  return (
    <Link className="order-row" to={`/orders/${order._id}`}>
      <div className="order-product">
        <div className="order-thumb"><ProductImage src={item?.image} alt={item?.name || 'Product'} /></div>
        <div>
          <strong>{item?.name || 'Item details unavailable'}</strong>
          <span>Order #{order._id.slice(-8).toUpperCase()}{admin && order.user?.name ? ` · ${order.user.name}` : ''}</span>
        </div>
      </div>
      <div className="order-date"><span>PLACED</span>{formatDate(order.createdAt)}</div>
      <div className="order-quantity"><span>QTY</span>{order.quantity}</div>
      <div className="order-total"><span>TOTAL</span>{formatPrice(order.totalPrice)}</div>
      <span className={`status-pill status-${order.status}`}>{order.status}</span>
      <span className="order-arrow" aria-hidden="true">↗</span>
    </Link>
  )
}

function OrderDetailPage() {
  const { orderId } = useParams()
  const location = useLocation()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .get(`/api/orders/${orderId}`)
      .then(({ data }) => { if (!cancelled) setOrder(data.data) })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [orderId])

  if (loading) return <div className="page-state"><span className="spinner" />Loading order…</div>
  if (error) return <ErrorState message={error} />

  return (
    <section className="order-detail-page">
      <Link className="back-link" to="/orders">← Back to orders</Link>
      <div className="order-confirmation">
        <span className="confirmation-mark">✓</span>
        <span className="eyebrow eyebrow-muted">{location.state?.justPlaced ? 'ORDER RECEIVED' : 'ORDER DETAILS'}</span>
        <h1>{location.state?.justPlaced ? 'You’re all set.' : 'Your order.'}</h1>
        <p>Order #{order._id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}</p>
      </div>
      <div className="order-detail-card">
        <div className="detail-order-item">
          <div className="order-thumb detail-order-thumb"><ProductImage src={order.item?.image} alt={order.item?.name || 'Product'} /></div>
          <div className="detail-order-name"><strong>{order.item?.name || 'Item details unavailable'}</strong><span>Quantity: {order.quantity}</span></div>
          <strong>{formatPrice(order.totalPrice)}</strong>
        </div>
        <div className="order-detail-meta">
          <div><span>STATUS</span><span className={`status-pill status-${order.status}`}>{order.status}</span></div>
          <div><span>SHIP TO</span><strong>{order.shippingAddress?.street || '—'}<br />{order.shippingAddress?.city || ''} {order.shippingAddress?.zipCode || ''}</strong></div>
        </div>
      </div>
      <Link className="button button-dark" to="/">Keep exploring <span>→</span></Link>
    </section>
  )
}

function AdminPage() {
  const [items, setItems] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadAdminData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [itemResponse, orderResponse] = await Promise.all([
        api.get('/api/items'),
        api.get('/api/orders/all'),
      ])
      setItems(itemResponse.data.data)
      setOrders(orderResponse.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAdminData() }, [loadAdminData])

  const deleteItem = async (item) => {
    if (!window.confirm(`Remove “${item.name}” from the active catalog?`)) return
    setError('')
    setNotice('')
    try {
      const { data } = await api.delete(`/api/items/${item._id}`)
      setNotice(data.message)
      await loadAdminData()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <section className="admin-page">
      <div className="orders-heading">
        <div><span className="eyebrow eyebrow-muted">STORE MANAGEMENT</span><h1>Admin desk<span className="brand-period">.</span></h1></div>
        <Link className="button button-quiet" to="/">View storefront <span>↗</span></Link>
      </div>
      {error && <ErrorState message={error} onRetry={loadAdminData} />}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      {loading ? <div className="page-state"><span className="spinner" />Loading the admin desk…</div> : (
        <>
          <div className="admin-metrics">
            <div><span>ACTIVE CATALOG</span><strong>{items.length}</strong></div>
            <div><span>ALL ORDERS</span><strong>{orders.length}</strong></div>
            <div><span>ORDER VALUE</span><strong>{formatPrice(orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0))}</strong></div>
          </div>
          <AdminItemForm onCreated={async (message) => { setNotice(message); await loadAdminData() }} onError={setError} />
          <div className="admin-section-heading"><div><span className="eyebrow eyebrow-muted">INVENTORY</span><h2>Manage your items</h2></div></div>
          {items.length ? (
            <div className="admin-items">
              {items.map((item) => (
                <AdminItemRow item={item} key={item._id} onDeleted={deleteItem} onError={setError} onUpdated={async (message) => { setNotice(message); await loadAdminData() }} />
              ))}
            </div>
          ) : <div className="admin-empty">No items in the catalog yet. Add the first one above.</div>}
          <div className="admin-section-heading admin-orders-heading"><div><span className="eyebrow eyebrow-muted">FULFILMENT</span><h2>All orders</h2></div></div>
          {orders.length ? <div className="orders-list">{orders.map((order) => <OrderRow admin key={order._id} order={order} />)}</div> : <div className="admin-empty">No orders have been placed yet.</div>}
        </>
      )}
    </section>
  )
}

function AdminItemForm({ onCreated, onError }) {
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const createItem = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const imageFile = formData.get('image')
    const imageUrl = String(formData.get('imageUrl') || '').trim()
    const hasImageFile = imageFile instanceof File && imageFile.size > 0

    if (hasImageFile === Boolean(imageUrl)) {
      onError('Provide either an image file or an image URL.')
      return
    }

    if (hasImageFile) formData.delete('imageUrl')
    else formData.delete('image')
    if (imageUrl) formData.set('imageUrl', imageUrl)

    onError('')
    setBusy(true)
    try {
      const { data } = await api.post('/api/items', formData)
      form.reset()
      setExpanded(false)
      await onCreated(data.message)
    } catch (err) {
      onError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-create">
      <button className="admin-create-toggle" onClick={() => setExpanded((value) => !value)} type="button">
        <span><span className="create-plus">{expanded ? '−' : '+'}</span><span><strong>Add an item</strong><small>Upload a product to the storefront</small></span></span>
        <span>{expanded ? 'Close' : 'New item'} <span aria-hidden="true">↗</span></span>
      </button>
      {expanded && (
        <form className="admin-item-form" onSubmit={createItem}>
          <div className="field-row">
            <label className="form-field"><span>Item name</span><input name="name" placeholder="Training football" required /></label>
            <label className="form-field"><span>Category</span><input name="category" placeholder="Football" /></label>
          </div>
          <label className="form-field"><span>Description</span><textarea name="description" placeholder="What makes this item great?" required rows="3" /></label>
          <div className="field-row">
            <label className="form-field"><span>Price</span><input min="0" name="price" placeholder="49.99" required step="0.01" type="number" /></label>
            <label className="form-field"><span>Stock</span><input min="0" name="stock" placeholder="10" required type="number" /></label>
            <label className="form-field"><span>Image URL (optional)</span><input name="imageUrl" placeholder="https://example.com/image.jpg" type="url" /></label>
          </div>
          <label className="form-field"><span>Or upload an image file (optional)</span><input accept="image/jpeg,image/png,image/webp,image/gif" name="image" type="file" /></label>
          <p className="upload-help">Provide either a public HTTP(S) image URL or a JPG, PNG, WebP or GIF file (max 5 MB).</p>
          <button className="button button-dark" disabled={busy} type="submit">{busy ? 'Adding item…' : 'Add to catalog'} <span>→</span></button>
        </form>
      )}
    </div>
  )
}

function AdminItemRow({ item, onDeleted, onError, onUpdated }) {
  const [busy, setBusy] = useState(false)

  const updateItem = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const imageFile = formData.get('image')
    const imageUrl = String(formData.get('imageUrl') || '').trim()
    const hasImageFile = imageFile instanceof File && imageFile.size > 0

    if (hasImageFile && imageUrl) {
      onError('Choose either an image file or an image URL, not both.')
      return
    }

    if (!hasImageFile) formData.delete('image')
    if (imageUrl) formData.set('imageUrl', imageUrl)
    else formData.delete('imageUrl')

    onError('')
    setBusy(true)
    try {
      const { data } = await api.put(`/api/items/${item._id}`, formData)
      await onUpdated(data.message)
    } catch (err) {
      onError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <details className="admin-item">
      <summary>
        <span className="admin-item-thumb"><ProductImage src={item.image} alt={item.name} /></span>
        <span className="admin-item-title"><strong>{item.name}</strong><small>{item.category || 'General'}</small></span>
        <span className="admin-item-stock">{item.stock} in stock</span>
        <strong className="admin-item-price">{formatPrice(item.price)}</strong>
        <span className="admin-edit-label">Edit <span>⌄</span></span>
      </summary>
      <form className="admin-item-form admin-edit-form" onSubmit={updateItem}>
        <div className="field-row">
          <label className="form-field"><span>Item name</span><input defaultValue={item.name} name="name" required /></label>
          <label className="form-field"><span>Category</span><input defaultValue={item.category} name="category" /></label>
        </div>
        <label className="form-field"><span>Description</span><textarea defaultValue={item.description} name="description" required rows="3" /></label>
        <div className="field-row">
          <label className="form-field"><span>Price</span><input defaultValue={item.price} min="0" name="price" required step="0.01" type="number" /></label>
          <label className="form-field"><span>Stock</span><input defaultValue={item.stock} min="0" name="stock" required type="number" /></label>
          <label className="form-field"><span>Replace image with URL (optional)</span><input name="imageUrl" placeholder="https://example.com/image.jpg" type="url" /></label>
        </div>
        <label className="form-field"><span>Or upload a replacement file (optional)</span><input accept="image/jpeg,image/png,image/webp,image/gif" name="image" type="file" /></label>
        <p className="upload-help">Provide either a public HTTP(S) image URL or a JPG, PNG, WebP or GIF file (max 5 MB).</p>
        <div className="admin-edit-actions">
          <button className="button button-dark button-small" disabled={busy} type="submit">{busy ? 'Saving…' : 'Save changes'}</button>
          <button className="button button-danger button-small" onClick={() => onDeleted(item)} type="button">Remove item</button>
        </div>
      </form>
    </details>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <span className="error-mark">!</span>
      <div><h3>We hit a snag</h3><p>{message}</p></div>
      {onRetry && <button className="button button-quiet button-small" onClick={onRetry} type="button">Try again</button>}
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="not-found">
      <span className="eyebrow eyebrow-muted">404 / OUT OF BOUNDS</span>
      <h1>Looks like<br /><span>you’re lost.</span></h1>
      <Link className="button button-dark" to="/">Back to the shop <span>→</span></Link>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" strokeWidth="1.6" />
      <path d="m15.5 15.5 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
    </svg>
  )
}

function ProductImage({ src, alt, loading }) {
  const [failedSrc, setFailedSrc] = useState('')
  const imageUrl = src ? getImageUrl(src) : ''

  if (!imageUrl || failedSrc === imageUrl) {
    return (
      <span className="image-fallback" role="img" aria-label={`${alt}: image unavailable`}>
        <span aria-hidden="true">✳</span>
        <small>Image unavailable</small>
      </span>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      loading={loading}
      onError={() => setFailedSrc(imageUrl)}
    />
  )
}

function formatPrice(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export default App
