import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

export async function seedWorkingHours() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
      transport: ws as any,
    },
  })

  try {
    // Get the first business (for testing)
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .limit(1)

    if (businessError || !businesses || businesses.length === 0) {
      console.error('Failed to find a business:', businessError)
      return false
    }

    const business_id = businesses[0].id
    console.log(`Seeding working hours for business: ${business_id}`)

    // 24-hour availability for all 7 days
    const workingHours = Array.from({ length: 7 }, (_, i) => ({
      business_id,
      day_of_week: i,
      is_open: true,
      start_time: '00:00',
      end_time: '23:45',
    }))

    // Delete existing working hours for this business first
    const { error: deleteError } = await supabase
      .from('working_hours')
      .delete()
      .eq('business_id', business_id)

    if (deleteError) {
      console.error('Failed to delete existing working hours:', deleteError)
      return false
    }

    // Insert new working hours
    const { data, error } = await supabase
      .from('working_hours')
      .insert(workingHours)
      .select()

    if (error) {
      console.error('Failed to seed working hours:', error)
      return false
    }

    console.log('✓ Working hours seeded: all 7 days (24-hour availability)')
    return true
  } catch (error) {
    console.error('Error seeding working hours:', error)
    return false
  }
}
