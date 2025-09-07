import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Minus, Upload, User, Building, Truck, FileText, CreditCard, Shield } from 'lucide-react';

interface DriverApplicationFormProps {
  onSuccess?: () => void;
}

interface VehicleInfo {
  type: string;
  make: string;
  model: string;
  year: string;
  plateNumber: string;
  color: string;
}

const DriverApplicationForm: React.FC<DriverApplicationFormProps> = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    partnerType: '',
    vehicleTypes: [] as string[],
    firstName: '',
    lastName: '',
    languagePreference: '',
    phoneNumber: '',
    email: '',
    referralCode: '',
    companyName: '',
    companyRegistrationNumber: '',
    numberOfDrivers: '',
    vehicles: [] as VehicleInfo[],
    nationalIdFile: null as File | null,
    driverLicenseFile: null as File | null,
    logbookFile: null as File | null,
    profilePhotoFile: null as File | null,
    billingType: '',
    mpesaAccountName: '',
    mpesaPhoneNumber: '',
    physicalAddress: '',
    consentGiven: false,
  });

  const vehicleTypeOptions = ['Bicycle','Motorcycle (Boda Boda)','Car','Pickup','Tuktuk','Lorry'];
  const languageOptions = ['English','Swahili','Kikuyu','Luo','Kamba','Kalenjin'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVehicleTypeToggle = (vehicleType: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.includes(vehicleType)
        ? prev.vehicleTypes.filter(type => type !== vehicleType)
        : [...prev.vehicleTypes, vehicleType]
    }));
  };

  const addVehicle = () => {
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, { type: '', make: '', model: '', year: '', plateNumber: '', color: '' }]
    }));
  };

  const removeVehicle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index)
    }));
  };

  const updateVehicle = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map((vehicle, i) => i === index ? { ...vehicle, [field]: value } : vehicle)
    }));
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return !!formData.partnerType;
      case 2: return formData.vehicleTypes.length > 0;
      case 3: {
        const basicRequired = formData.firstName && formData.lastName && formData.phoneNumber && formData.email;
        if (formData.partnerType === 'company') {
          return !!(basicRequired && formData.companyName && formData.companyRegistrationNumber && formData.numberOfDrivers);
        }
        return !!basicRequired;
      }
      case 4: return formData.vehicles.length > 0 && formData.vehicles.every(v => v.type && v.make && v.model && v.year && v.plateNumber && v.color);
      case 5: return !!(formData.nationalIdFile && formData.driverLicenseFile && formData.logbookFile);
      case 6: return !!formData.profilePhotoFile;
      case 7: return !!(formData.billingType && formData.mpesaAccountName && formData.mpesaPhoneNumber && formData.physicalAddress);
      case 8: return formData.consentGiven;
      default: return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, 8));
    else toast.error('Please fill in all required fields');
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const submitApplication = async () => {
    if (!validateStep(8)) {
      toast.error('Please complete all required fields');
      return;
    }
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to submit application');
        return;
      }

      // Check if user already has a driver application
      const { data: existingApplication, error: applicationCheckError } = await supabase
        .from('driver_applications')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (applicationCheckError && applicationCheckError.code !== 'PGRST116') {
        console.error('Error checking application:', applicationCheckError);
        toast.error('Failed to check existing application. Please try again.');
        return;
      }

      if (existingApplication) {
        toast.error('You have already submitted a driver application. Please wait for review.');
        return;
      }

      // Prepare comprehensive application data
      const applicationData = {
        user_id: user.id,
        partner_type: formData.partnerType,
        vehicle_types: formData.vehicleTypes,
        first_name: formData.firstName,
        last_name: formData.lastName,
        language_preference: formData.languagePreference,
        phone_number: formData.phoneNumber,
        email: formData.email,
        referral_code: formData.referralCode,
        company_name: formData.companyName,
        company_registration_number: formData.companyRegistrationNumber,
        number_of_drivers: formData.numberOfDrivers,
        vehicles: formData.vehicles as any,
        billing_type: formData.billingType,
        mpesa_account_name: formData.mpesaAccountName,
        mpesa_phone_number: formData.mpesaPhoneNumber,
        physical_address: formData.physicalAddress,
        consent_given: formData.consentGiven,
        application_status: 'pending'
      };

      // Insert comprehensive driver application
      const { error: applicationError } = await supabase
        .from('driver_applications')
        .insert(applicationData);

      if (applicationError) {
        console.error('Error submitting driver application:', applicationError);
        toast.error('Failed to submit driver application. Please try again.');
        return;
      }

      // Update or create basic profile with driver role
      const profileData = {
        id: user.id,
        full_name: `${formData.firstName} ${formData.lastName}`,
        phone_number: formData.phoneNumber,
        role: 'driver' as const,
        is_active: false
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Don't fail the entire process if profile update fails
      }

      // Create notification for admin review
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'New Driver Application Submitted',
          message: `Driver application from ${formData.firstName} ${formData.lastName} requires review`,
          type: 'driver_application',
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      toast.success('Driver application submitted successfully! We will review your application and contact you soon.');
      onSuccess?.();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred while submitting your application');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = ['Partner Type','Vehicle Type','Information','Vehicles','Documents','Photo','Payment','Consent'];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />
                Partner Type</CardTitle>
              <CardDescription>Are you signing up as an individual or a transport company?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={formData.partnerType} onValueChange={(value) => handleInputChange('partnerType', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual">Individual (using my own vehicle)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="company" id="company" />
                  <Label htmlFor="company">Transport Company (with a fleet of drivers)</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5" />
                Fleet/Vehicle Type</CardTitle>
              <CardDescription>Select one or more vehicle types you will use for deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {vehicleTypeOptions.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox id={type} checked={formData.vehicleTypes.includes(type)} onCheckedChange={() => handleVehicleTypeToggle(type)} />
                    <Label htmlFor={type}>{type}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">{formData.partnerType === 'company' ? <Building className="w-5 h-5" /> : <User className="w-5 h-5" />} {formData.partnerType === 'company' ? 'Company Information' : 'Personal Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} required />
                </div>
              </div>
              <div>
                <Label htmlFor="language">Language Preference</Label>
                <Select value={formData.languagePreference} onValueChange={(value) => handleInputChange('languagePreference', value)}>
                  <SelectTrigger><SelectValue placeholder="Select preferred language" /></SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (<SelectItem key={lang} value={lang}>{lang}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} placeholder="+254..." required />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
                </div>
              </div>
              <div>
                <Label htmlFor="referral">Referral Code (Optional)</Label>
                <Input id="referral" value={formData.referralCode} onChange={(e) => handleInputChange('referralCode', e.target.value)} />
              </div>
              {formData.partnerType === 'company' && (
                <>
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input id="companyName" value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="regNumber">Company Registration Number *</Label>
                      <Input id="regNumber" value={formData.companyRegistrationNumber} onChange={(e) => handleInputChange('companyRegistrationNumber', e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="driverCount">Number of Drivers in Fleet *</Label>
                      <Input id="driverCount" type="number" value={formData.numberOfDrivers} onChange={(e) => handleInputChange('numberOfDrivers', e.target.value)} required />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5" /> Vehicle Information</CardTitle>
              <CardDescription>Add details about your vehicle(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.vehicles.map((vehicle, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Vehicle {index + 1}</h4>
                      {formData.vehicles.length > 1 && (
                        <Button variant="outline" size="sm" onClick={() => removeVehicle(index)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Vehicle Type *</Label>
                        <Select value={vehicle.type} onValueChange={(value) => updateVehicle(index, 'type', value)}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            {vehicleTypeOptions.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>License Plate Number *</Label>
                        <Input value={vehicle.plateNumber} onChange={(e) => updateVehicle(index, 'plateNumber', e.target.value)} />
                      </div>
                      <div>
                        <Label>Make & Model *</Label>
                        <Input value={vehicle.make} onChange={(e) => updateVehicle(index, 'make', e.target.value)} placeholder="e.g., Toyota" />
                      </div>
                      <div>
                        <Label>Model *</Label>
                        <Input value={vehicle.model} onChange={(e) => updateVehicle(index, 'model', e.target.value)} placeholder="e.g., Vitz" />
                      </div>
                      <div>
                        <Label>Year of Manufacture *</Label>
                        <Input value={vehicle.year} onChange={(e) => updateVehicle(index, 'year', e.target.value)} placeholder="e.g., 2020" />
                      </div>
                      <div>
                        <Label>Vehicle Color *</Label>
                        <Input value={vehicle.color} onChange={(e) => updateVehicle(index, 'color', e.target.value)} placeholder="e.g., White" />
                      </div>
                    </div>
                  </Card>
                ))}
                <Button variant="outline" onClick={addVehicle} className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Add Another Vehicle
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Legal & Document Uploads</CardTitle>
              <CardDescription>Upload required documents for verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nationalId">National ID (clear front photo) *</Label>
                <Input id="nationalId" type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload('nationalIdFile', (e.target as HTMLInputElement).files?.[0] || null)} />
              </div>
              <div>
                <Label htmlFor="license">Driver's License (valid) *</Label>
                <Input id="license" type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload('driverLicenseFile', (e.target as HTMLInputElement).files?.[0] || null)} />
              </div>
              <div>
                <Label htmlFor="logbook">Logbook or Sales Agreement *</Label>
                <Input id="logbook" type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload('logbookFile', (e.target as HTMLInputElement).files?.[0] || null)} />
              </div>
            </CardContent>
          </Card>
        );
      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Driver Profile Photo</CardTitle>
              <CardDescription>Upload a clear passport-style photo</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="profilePhoto">Profile Photo *</Label>
                <Input id="profilePhoto" type="file" accept="image/*" onChange={(e) => handleFileUpload('profilePhotoFile', (e.target as HTMLInputElement).files?.[0] || null)} />
              </div>
            </CardContent>
          </Card>
        );
      case 7:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Billing Type *</Label>
                <RadioGroup value={formData.billingType} onValueChange={(value) => handleInputChange('billingType', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="bill-individual" />
                    <Label htmlFor="bill-individual">Individual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="bill-company" />
                    <Label htmlFor="bill-company">Company</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mpesaName">MPESA Account Name *</Label>
                  <Input id="mpesaName" value={formData.mpesaAccountName} onChange={(e) => handleInputChange('mpesaAccountName', e.target.value)} placeholder="As registered on MPESA" />
                </div>
                <div>
                  <Label htmlFor="mpesaPhone">MPESA Phone Number *</Label>
                  <Input id="mpesaPhone" value={formData.mpesaPhoneNumber} onChange={(e) => handleInputChange('mpesaPhoneNumber', e.target.value)} placeholder="+254..." />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Physical Address *</Label>
                <Textarea id="address" value={formData.physicalAddress} onChange={(e) => handleInputChange('physicalAddress', e.target.value)} placeholder="Enter your complete physical address" rows={3} />
              </div>
            </CardContent>
          </Card>
        );
      case 8:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Consent & Agreement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-2">
                <Checkbox id="consent" checked={formData.consentGiven} onCheckedChange={(checked) => handleInputChange('consentGiven', checked)} />
                <Label htmlFor="consent" className="text-sm leading-relaxed">I give consent for Deliveries to process and store my information for onboarding, background checks, and operational use. I understand that this information will be used to verify my identity, assess my application, and facilitate delivery services if approved. I have read and agree to the Terms of Service and Privacy Policy.</Label>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Driver Application</h1>
          <span className="text-sm text-muted-foreground">Step {currentStep} of {steps.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / steps.length) * 100}%` }}></div>
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <span key={step} className={`text-xs ${index + 1 <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{step}</span>
          ))}
        </div>
      </div>
      <div className="mb-8">{renderStepContent()}</div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>Previous</Button>
        {currentStep === steps.length ? (
          <Button onClick={submitApplication} disabled={!validateStep(currentStep) || isLoading}>{isLoading ? 'Submitting...' : 'Submit Application'}</Button>
        ) : (
          <Button onClick={nextStep} disabled={!validateStep(currentStep)}>Next</Button>
        )}
      </div>
    </div>
  );
};

export default DriverApplicationForm;


