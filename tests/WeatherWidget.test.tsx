import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useDashboardStore } from '../src/store/dashboardStore'
import { WeatherWidget } from '../src/components/widgets/WeatherWidget'
import type { WeatherData } from '../src/types'

vi.mock('../src/store/dashboardStore', () => ({
  useDashboardStore: vi.fn(),
}))

const mockWeather: WeatherData = {
  temperature: 22,
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 12,
  location: 'San Francisco, CA',
  icon: 'partly-cloudy',
}

const apiWeather = {
  main: { temp: 18.6, humidity: 72 },
  weather: [{ main: 'Rain' }],
  wind: { speed: 4.2 },
  name: 'London',
  sys: { country: 'GB' },
}

describe('WeatherWidget', () => {
  const mockSetWeather = vi.fn()
  const mockFetch = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
    vi.stubGlobal('fetch', mockFetch)
    vi.mocked(useDashboardStore).mockReturnValue({
      weather: mockWeather,
      setWeather: mockSetWeather,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders initial mock weather without fetching when data already exists', () => {
    render(<WeatherWidget />)

    expect(screen.getByRole('heading', { name: 'Weather' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'City name' })).toHaveValue('San Francisco')
    expect(screen.getByText('22°C')).toBeInTheDocument()
    expect(screen.getByText('Partly Cloudy')).toBeInTheDocument()
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
    expect(screen.getByText('65%')).toBeInTheDocument()
    expect(screen.getByText('12 km/h')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search weather' })).toBeEnabled()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetches the default city on mount when no weather is stored', async () => {
    vi.mocked(useDashboardStore).mockReturnValue({
      weather: null,
      setWeather: mockSetWeather,
    })
    mockFetch.mockResolvedValue(new Response(JSON.stringify(apiWeather)))

    render(<WeatherWidget />)

    expect(screen.getByText('22°C')).toBeInTheDocument()
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.openweathermap.org/data/2.5/weather?q=San%20Francisco&appid=demo_key&units=metric'
    )
    await waitFor(() => expect(mockSetWeather).toHaveBeenCalledWith({
      temperature: 19,
      condition: 'Rain',
      humidity: 72,
      windSpeed: 15,
      location: 'London, GB',
      icon: 'rain',
    }))
    expect(screen.getByRole('button', { name: 'Search weather' })).toBeEnabled()
  })

  it('submits the entered city and stores the API weather', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue(new Response(JSON.stringify(apiWeather)))
    render(<WeatherWidget />)

    const input = screen.getByRole('textbox', { name: 'City name' })
    await user.clear(input)
    await user.type(input, 'London & Westminster')
    await user.click(screen.getByRole('button', { name: 'Search weather' }))

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.openweathermap.org/data/2.5/weather?q=London%20%26%20Westminster&appid=demo_key&units=metric'
    )
    await waitFor(() => expect(mockSetWeather).toHaveBeenCalledWith({
      temperature: 19,
      condition: 'Rain',
      humidity: 72,
      windSpeed: 15,
      location: 'London, GB',
      icon: 'rain',
    }))
  })

  it('disables search while a request is pending and enables it after completion', async () => {
    const user = userEvent.setup()
    let resolveResponse!: (response: Response) => void
    mockFetch.mockReturnValue(new Promise<Response>((resolve) => {
      resolveResponse = resolve
    }))
    render(<WeatherWidget />)

    const button = screen.getByRole('button', { name: 'Search weather' })
    await user.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('...')
    expect(mockSetWeather).not.toHaveBeenCalled()
    await user.click(button)
    expect(mockFetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveResponse(new Response(JSON.stringify(apiWeather)))
    })

    expect(button).toBeEnabled()
    expect(button).toHaveTextContent('Search')
    expect(mockSetWeather).toHaveBeenCalledTimes(1)
  })

  it.each(['HTTP error', 'network error', 'invalid JSON'])(
    'shows a fallback and allows retry after an API %s',
    async (failure) => {
      const user = userEvent.setup()
      vi.spyOn(console, 'error').mockImplementation(() => {})
      if (failure === 'network error') {
        mockFetch.mockRejectedValueOnce(new Error('Network unavailable'))
      } else if (failure === 'invalid JSON') {
        mockFetch.mockResolvedValueOnce(new Response('invalid JSON'))
      } else {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 404 }))
      }
      render(<WeatherWidget />)

      const button = screen.getByRole('button', { name: 'Search weather' })
      await user.click(button)

      expect(await screen.findByText('Unable to fetch weather. Using mock data.')).toBeInTheDocument()
      expect(mockSetWeather).toHaveBeenCalledWith(mockWeather)
      expect(screen.getByText('22°C')).toBeInTheDocument()
      expect(button).toBeEnabled()
      expect(button).toHaveTextContent('Search')

      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(apiWeather)))
      await user.click(button)

      await waitFor(() => expect(mockSetWeather).toHaveBeenLastCalledWith(
        expect.objectContaining({ location: 'London, GB', temperature: 19 })
      ))
      expect(screen.queryByText('Unable to fetch weather. Using mock data.')).not.toBeInTheDocument()
      expect(button).toBeEnabled()
    }
  )
})
