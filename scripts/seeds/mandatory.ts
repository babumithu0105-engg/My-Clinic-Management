import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { hash } from 'bcryptjs'

export async function seedMandatory() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
      transport: ws as any,
    },
  })

  try {
    console.log('Seeding mandatory data...\n')

    // Create organization
    console.log('Creating organization...')
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .insert({
        name: 'Herz Solutions Inc',
      })
      .select('id')
      .single()

    if (businessError) {
      console.error('Failed to create organization:', businessError)
      return false
    }

    const businessId = businessData.id
    console.log(`✓ Organization created: ${businessId}`)

    // Create admin user
    const adminEmail = 'admin@clinic.local'
    const adminPassword = 'Admin@123456'

    console.log('Creating admin user...')

    // Check if admin user already exists
    const { data: existingAdmin, error: queryError } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .single()

    if (queryError && queryError.code !== 'PGRST116') {
      console.error('Failed to query admin user:', queryError)
      return false
    }

    let adminId: string
    if (existingAdmin) {
      console.log(`✓ Admin user already exists: ${adminEmail}`)
      adminId = existingAdmin.id
    } else {
      const passwordHash = await hash(adminPassword, 10)

      const { data: newAdmin, error: insertError } = await supabase
        .from('users')
        .insert({
          email: adminEmail,
          password_hash: passwordHash,
          name: 'Admin User',
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Failed to create admin user:', insertError)
        return false
      }

      adminId = newAdmin.id
      console.log(`\n✅ Admin user created successfully\n`)
      console.log(`📧 Email: ${adminEmail}`)
      console.log(`🔑 Password: ${adminPassword}\n`)
      console.log('⚠️  Save this password securely - it won\'t be displayed again\n')
    }

    // Link admin user to organization
    console.log('Linking admin user to organization...')
    const { error: linkError } = await supabase
      .from('business_users')
      .insert({
        business_id: businessId,
        user_id: adminId,
        role: 'admin',
      })

    if (linkError && !linkError.message?.includes('duplicate')) {
      console.error('Failed to link admin to organization:', linkError)
      return false
    }

    console.log('✓ Admin linked to organization')

    console.log('\n✓ Mandatory seed completed')
    return true
  } catch (error) {
    console.error('Error in mandatory seed:', error)
    return false
  }
}
