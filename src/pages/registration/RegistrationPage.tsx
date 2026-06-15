import { RegistrationPageContent, useRegistrationPage } from '@/features/registration'

export default function RegistrationPage() {
  return <RegistrationPageContent {...useRegistrationPage()} />
}
