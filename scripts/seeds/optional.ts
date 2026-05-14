import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { hash } from 'bcryptjs'

export async function seedOptional() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
      transport: ws as any,
    },
  })

  try {
    console.log('Running optional seeds...\n')

    // Get existing organization
    console.log('Finding organization...')
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('name', 'Herz Solutions Inc')
      .single()

    if (businessError) {
      console.error('Failed to find organization:', businessError)
      return false
    }

    const businessId = businessData.id
    console.log(`✓ Organization found: ${businessId}\n`)

    // Create/Update Receptionist user
    const receptionistEmail = 'receptionist@clinic.local'
    const receptionistPassword = 'Receptionist@123456'

    console.log('Setting up receptionist user...')
    const { data: existingReceptionist } = await supabase
      .from('users')
      .select('id')
      .eq('email', receptionistEmail)
      .single()

    let receptionistId: string
    if (existingReceptionist) {
      const passwordHash = await hash(receptionistPassword, 10)
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', existingReceptionist.id)

      if (updateError) {
        console.error('Failed to update receptionist password:', updateError)
        return false
      }
      receptionistId = existingReceptionist.id
    } else {
      const passwordHash = await hash(receptionistPassword, 10)
      const { data: newReceptionist, error: insertError } = await supabase
        .from('users')
        .insert({
          email: receptionistEmail,
          password_hash: passwordHash,
          name: 'Test Receptionist',
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Failed to create receptionist user:', insertError)
        return false
      }
      receptionistId = newReceptionist.id
    }

    const { error: receptionistLinkError } = await supabase
      .from('business_users')
      .insert({
        business_id: businessId,
        user_id: receptionistId,
        role: 'receptionist',
      })

    if (receptionistLinkError && !receptionistLinkError.message?.includes('duplicate')) {
      console.error('Failed to link receptionist to business:', receptionistLinkError)
      return false
    }

    console.log(`\n✅ Receptionist user ready\n`)
    console.log(`📧 Email: ${receptionistEmail}`)
    console.log(`🔑 Password: ${receptionistPassword}\n`)

    // Create/Update Doctor user
    const doctorEmail = 'doctor@clinic.local'
    const doctorPassword = 'Doctor@123456'

    console.log('Setting up doctor user...')
    const { data: existingDoctor } = await supabase
      .from('users')
      .select('id')
      .eq('email', doctorEmail)
      .single()

    let doctorId: string
    if (existingDoctor) {
      const passwordHash = await hash(doctorPassword, 10)
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', existingDoctor.id)

      if (updateError) {
        console.error('Failed to update doctor password:', updateError)
        return false
      }
      doctorId = existingDoctor.id
    } else {
      const passwordHash = await hash(doctorPassword, 10)
      const { data: newDoctor, error: insertError } = await supabase
        .from('users')
        .insert({
          email: doctorEmail,
          password_hash: passwordHash,
          name: 'Test Doctor',
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Failed to create doctor user:', insertError)
        return false
      }
      doctorId = newDoctor.id
    }

    const { error: doctorLinkError } = await supabase
      .from('business_users')
      .insert({
        business_id: businessId,
        user_id: doctorId,
        role: 'doctor',
      })

    if (doctorLinkError && !doctorLinkError.message?.includes('duplicate')) {
      console.error('Failed to link doctor to business:', doctorLinkError)
      return false
    }

    console.log(`\n✅ Doctor user ready\n`)
    console.log(`📧 Email: ${doctorEmail}`)
    console.log(`🔑 Password: ${doctorPassword}\n`)

    console.log('✓ Optional seed completed')
    return true
  } catch (error) {
    console.error('Error in optional seed:', error)
    return false
  }
}
