// App.tsx (Redesigned Structure)

import {
  Briefcase,
  Copy,
  History,
  RefreshCw,
  Send,
  Trash2,
  ChevronDown, // Add for collapsible section
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { FiLinkedin } from "react-icons/fi";
import { CiTwitter } from "react-icons/ci";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";
import { Checkbox } from "./components/ui/checkbox";
import { Button } from "./components/ui/button";
import { useEffect, useState } from "react";
import { ThreeDot } from "react-loading-indicators";
import toast from "react-hot-toast";
import type {
  FormData,
  GeneratedMessage,
  Platform,
  SavedMessage,
  Tone, // Import Tone type
  ReasonType, // Import ReasonType type
  JobType, // Import JobType type
} from "./type";
import { GenerateDM } from "./lib/GenerateDM";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet"; // Import Sheet components

// Assuming you have an Accordion component or will use simple state for collapse
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";

const initialFormData: FormData = {
  yourName: "",
  yourRole: "",
  targetName: "",
  targetRole: "",
  companyName: "",
  jobTitle: "",
  personalNote: "",
  reason: "job_application",
  tone: "professional",
  mentionResume: false,
  resumeLink: "",
  platform: "linkedin",
  jobType: "internship",
};

const reasonOptions = [
  { value: "job_application", label: "Applying for a specific role" },
  { value: "internship_inquiry", label: "Seeking internship opportunities" },
  { value: "referral_request", label: "Asking for employee referral" },
  { value: "informational", label: "Learning about company/role" },
  { value: "follow_up", label: "Following up on application" },
];

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "humble", label: "Humble" },
];

const jobTypeOptions = [
  { value: "internship", label: "Internship" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "freelance", label: "Freelance" },
];

const App = () => {
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessages, setGeneratedMessages] =
    useState<GeneratedMessage>();
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
  // State to manage the optional section collapse
  const [isOptionalExpanded, setIsOptionalExpanded] = useState(false);
  // State to manage the Sheet visibility
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("jobSeekerDmHistory");
    if (saved) {
      try {
        // Ensure saved data matches the FormData structure, add defaults if needed
        const parsedSaved = JSON.parse(saved);
        const historyWithDefaults = parsedSaved.map((item: SavedMessage) => ({
          ...item,
          formData: {
            ...initialFormData, // Start with defaults
            ...item.formData, // Overlay saved data
            // Add any new fields with defaults if necessary
            jobType: item.formData.jobType || initialFormData.jobType,
          },
        }));
        setSavedMessages(historyWithDefaults);
      } catch (e) {
        console.error("Failed to parse saved history", e);
        localStorage.removeItem("jobSeekerDmHistory"); // Clear invalid data
      }
    }
  }, []);

  // Fix the state update for jobType
  const handleSelectChange = (name: keyof FormData, value: string) => {
    // Need type assertion or careful handling as value is always string from Select
    setFormData((prev) => ({
      ...prev,
      [name]: value as any, // Use 'as any' or specific handling for non-string types if added
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedMessages(undefined); // Clear previous results while generating

    try {
      console.log("Submitting form data:", formData);
      const messages = await GenerateDM({ formData });
      setGeneratedMessages(messages);
      console.log("Generated messages:", messages);

      // Save to history
      const newSavedMessage: SavedMessage = {
        id: Date.now().toString(),
        platform,
        formData: { ...formData },
        messages,
        timestamp: Date.now(),
      };
      // Prepend new message, keep only last 10
      const updatedHistory = [newSavedMessage, ...savedMessages].slice(0, 10);
      setSavedMessages(updatedHistory);
      localStorage.setItem(
        "jobSeekerDmHistory",
        JSON.stringify(updatedHistory)
      );
      toast.success("Messages generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate messages. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied to clipboard");
  };

  const regenerateMessages = async () => {
    if (!formData) return; // Cannot regenerate without formData

    setIsGenerating(true);
    setGeneratedMessages(undefined); // Clear previous results

    try {
      console.log("Regenerating with form data:", formData);
      const messages = await GenerateDM({ formData });
      setGeneratedMessages(messages);
      console.log("Regenerated messages:", messages);
      toast.success("Messages regenerated!");
    } catch (error) {
      console.error("Regeneration error:", error);
      toast.error("Failed to regenerate messages. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSavedMessage = (saved: SavedMessage) => {
    setPlatform(saved.platform);
    setFormData(saved.formData);
    setGeneratedMessages(saved.messages);
    setIsHistorySheetOpen(false); // Close the sheet after loading
    toast.success("Message loaded from history");
  };

  const deleteSavedMessage = (id: string) => {
    const updatedHistory = savedMessages.filter((msg) => msg.id !== id);
    setSavedMessages(updatedHistory);
    localStorage.setItem("jobSeekerDmHistory", JSON.stringify(updatedHistory));
    toast.success("Message deleted from history");
  };

  const clearForm = () => {
    setFormData(initialFormData);
    setGeneratedMessages(undefined);
    setIsOptionalExpanded(false); // Collapse optional section
    toast("Form cleared", { icon: "✨" });
  };

  return (
    <main className='min-h-screen bg-gradient-to-br from-black to-gray-900 text-white'>
      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        <header className='flex flex-col items-center mb-8 text-center'>
          <h1 className='text-4xl md:text-5xl font-bold mb-2 text-blue-400'>
            AI Cold DM Generator
          </h1>
          <p className='text-muted-foreground text-lg max-w-2xl'>
            Craft personalized outreach messages for job applications on
            LinkedIn & Twitter
          </p>
        </header>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Left Column - Form */}
          <div>
            <Card className='shadow-lg border border-white/10 bg-gray-900 text-white'>
              <CardHeader className='border-b border-white/10'>
                <CardTitle>Message Details</CardTitle>
                <CardDescription className='text-muted-foreground'>
                  Fill in the details below to generate your personalized
                  message.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs
                  value={platform}
                  onValueChange={(value) => setPlatform(value as Platform)}
                  className='mb-6'
                >
                  <TabsList className='grid w-full grid-cols-2 bg-gray-800 border border-gray-700'>
                    <TabsTrigger
                      value='linkedin'
                      className='flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                    >
                      <FiLinkedin className='h-4 w-4' />
                      LinkedIn
                    </TabsTrigger>
                    <TabsTrigger
                      value='twitter'
                      className='flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                    >
                      <CiTwitter className='h-4 w-4' />
                      Twitter
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <form onSubmit={handleSubmit} className='space-y-3'>
                  {/* About You Section */}
                  <div className='space-y-3 border-b pb-4 border-white/10'>
                    <h3 className='text-lg font-semibold'>About You</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-3'>
                        <Label htmlFor='yourName'>Your Name</Label>
                        <Input
                          id='yourName'
                          name='yourName'
                          placeholder='John Doe'
                          required
                          value={formData.yourName}
                          onChange={handleInputChange}
                          className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                        />
                      </div>
                      <div className='space-y-3'>
                        <Label htmlFor='yourRole'>Your Role</Label>
                        <Input
                          id='yourRole'
                          name='yourRole'
                          placeholder='Software Engineer'
                          required
                          value={formData.yourRole}
                          onChange={handleInputChange}
                          className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                        />
                      </div>
                    </div>
                  </div>

                  {/* About Target & Role Section */}
                  <div className='space-y-3 border-b pb-6 border-white/10'>
                    <h3 className='text-lg font-semibold'>
                      About the Target & Role
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-3'>
                        <Label htmlFor='targetName'>Target's Name</Label>
                        <Input
                          id='targetName'
                          name='targetName'
                          placeholder='Jane Smith'
                          required
                          value={formData.targetName}
                          onChange={handleInputChange}
                          className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                        />
                      </div>
                      <div className='space-y-3'>
                        <Label htmlFor='targetRole'>Target's Role</Label>
                        <Input
                          id='targetRole'
                          name='targetRole'
                          placeholder='Product Manager'
                          required
                          value={formData.targetRole}
                          onChange={handleInputChange}
                          className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                        />
                      </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-3'>
                        <Label htmlFor='companyName'>Company Name</Label>
                        <Input
                          id='companyName'
                          name='companyName'
                          placeholder='Acme Inc.'
                          required
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                        />
                      </div>
                      <div className='space-y-3'>
                        <Label htmlFor='jobTitle'>Job Title Applied For</Label>
                        <Input
                          id='jobTitle'
                          name='jobTitle'
                          placeholder='Software Engineer'
                          required
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Message Preferences Section */}
                  <div className='space-y-3 border-b pb-6 border-white/10'>
                    <h3 className='text-lg font-semibold'>
                      Message Preferences
                    </h3>
                    <div className='space-y-3'>
                      <Label htmlFor='reason'>Reason for DM</Label>
                      <Select
                        value={formData.reason}
                        onValueChange={(value: ReasonType) =>
                          handleSelectChange("reason", value)
                        }
                      >
                        <SelectTrigger className='bg-gray-800 border-gray-700 text-white focus:ring-blue-500'>
                          <SelectValue placeholder='Select a reason' />
                        </SelectTrigger>
                        <SelectContent className='bg-gray-900 text-white border-gray-700'>
                          {reasonOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-3'>
                        <Label htmlFor='reason'>Tone of Message</Label>
                        <Select
                          value={formData.tone}
                          onValueChange={(value: Tone) =>
                            handleSelectChange("tone", value)
                          }
                        >
                          <SelectTrigger className='bg-gray-800 border-gray-700 text-white focus:ring-blue-500'>
                            <SelectValue placeholder='Select a Tone' />
                          </SelectTrigger>
                          <SelectContent className='bg-gray-900 text-white border-gray-700'>
                            {toneOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='space-y-3'>
                        <Label htmlFor='jobType'>Job Type</Label>
                        <Select
                          value={formData.jobType}
                          onValueChange={(value: JobType) =>
                            // FIX: Corrected name to "jobType" (camelCase)
                            handleSelectChange("jobType", value)
                          }
                        >
                          <SelectTrigger className='bg-gray-800 border-gray-700 text-white focus:ring-blue-500'>
                            <SelectValue placeholder='Select a Job Type' />
                          </SelectTrigger>
                          <SelectContent className='bg-gray-900 text-white border-gray-700'>
                            {jobTypeOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Optional Details Section (Collapsible) */}
                  <div className='space-y-3 border-b pb-6 border-white/10'>
                    <button
                      type='button'
                      className='flex items-center justify-between w-full text-lg font-semibold text-left'
                      onClick={() => setIsOptionalExpanded(!isOptionalExpanded)}
                    >
                      Optional Details
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          isOptionalExpanded ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                    {isOptionalExpanded && (
                      <div className='space-y-3 pt-2'>
                        {" "}
                        {/* Add padding-top when expanded */}
                        <div className='space-y-3'>
                          <Label htmlFor='personalNote'>Personal Note</Label>
                          <Textarea
                            id='personalNote'
                            name='personalNote'
                            placeholder='e.g., I noticed your recent post about...'
                            rows={3}
                            value={formData.personalNote || ""} // Use '' for controlled component
                            onChange={handleInputChange}
                            className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                          />
                          <p className='text-xs text-muted-foreground'>
                            Add a personal touch (e.g., mention a shared
                            connection, recent achievement, or post).
                          </p>
                        </div>
                        <div className='space-y-3'>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='mentionResume'
                              checked={formData.mentionResume}
                              onCheckedChange={(checked) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  mentionResume: checked === true,
                                }))
                              }
                              className='border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white'
                            />
                            <Label
                              htmlFor='mentionResume'
                              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                            >
                              Mention that you've attached your resume
                            </Label>
                          </div>
                        </div>
                        {formData.mentionResume && (
                          <div className='space-y-3'>
                            <Label htmlFor='resumeLink'>Resume Link</Label>
                            <Input
                              id='resumeLink'
                              name='resumeLink'
                              placeholder='https://example.com/resume.pdf'
                              required={formData.mentionResume} // Make required only if checkbox is checked
                              value={formData.resumeLink || ""} // Use '' for controlled component
                              onChange={handleInputChange}
                              className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className='flex flex-col justify-center items-center sm:flex-row gap-3 pt-2'>
                    <Button
                      type='submit'
                      className='flex-1 bg-blue-600 hover:bg-blue-700 text-md font-bold text-white py-2.5 px-2.5 md:py-5' // Increased padding for larger button
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <ThreeDot
                          variant='brick-stack'
                          color='#ffffff' // White loading indicator for dark background
                          size='small'
                        />
                      ) : (
                        <>
                          <Send className='mr-2 h-4 w-4' />
                          Generate DM
                        </>
                      )}
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={clearForm}
                      className='flex-1 sm:flex-none border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
                    >
                      Clear Form
                    </Button>

                    {/* History Sheet Trigger */}
                    <Sheet
                      open={isHistorySheetOpen}
                      onOpenChange={setIsHistorySheetOpen}
                    >
                      <SheetTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          className='flex-1 sm:flex-none border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
                        >
                          <History className='h-4 w-4 mr-2' /> History
                        </Button>
                      </SheetTrigger>
                      <SheetContent className='bg-gray-900 text-white border-gray-700 w-[400px] sm:w-[540px] flex flex-col px-2'>
                        <SheetHeader className='border-b pb-4 border-gray-700'>
                          <SheetTitle className='text-xl font-bold'>
                            Message History
                          </SheetTitle>
                          <SheetDescription>
                            Manage your previously generated messages.
                          </SheetDescription>
                          {/* Optional Description */}
                        </SheetHeader>
                        <div className='flex-grow overflow-y-auto pr-2 -mr-2'>
                          {" "}
                          {/* Add padding-right and negative margin to account for scrollbar width */}
                          {savedMessages.length === 0 ? (
                            <p className='text-muted-foreground text-center mt-8'>
                              No saved messages yet. <br /> Generate one first!
                            </p>
                          ) : (
                            <div className='space-y-4'>
                              {savedMessages.map((saved) => (
                                <div
                                  key={saved.id}
                                  className='p-4 border border-gray-700 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex justify-between items-start'
                                >
                                  <div
                                    className='cursor-pointer flex-grow pr-4' // Add right padding for delete button space
                                    onClick={() => loadSavedMessage(saved)}
                                  >
                                    <div className='flex items-center gap-2 text-blue-400 mb-1'>
                                      {saved.platform === "linkedin" ? (
                                        <FiLinkedin className='h-5 w-5' />
                                      ) : (
                                        <CiTwitter className='h-5 w-5' />
                                      )}
                                      <span className='font-semibold text-white'>
                                        {saved.formData.targetName}
                                      </span>
                                      <span className='text-sm text-gray-400'>
                                        ({saved.formData.companyName})
                                      </span>
                                    </div>
                                    <div className='text-xs text-gray-400 mb-2'>
                                      {new Date(
                                        saved.timestamp
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                  <Button
                                    variant='ghost'
                                    size='sm' // Reduced size
                                    onClick={(e) => {
                                      // Prevent click from triggering loadSavedMessage
                                      e.stopPropagation();
                                      deleteSavedMessage(saved.id);
                                    }}
                                    className='text-red-400 hover:bg-gray-700 hover:text-red-500'
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className='flex flex-col space-y-4'>
            {isGenerating ? (
              // ... (Loading Card)
              <Card className='shadow-lg border border-white/10 bg-gray-900 text-white flex flex-grow items-center justify-center min-h-[400px]'>
                <div className='text-center p-8'>
                  <div className='mb-4'>
                    <ThreeDot
                      variant='brick-stack'
                      color='#ffffff'
                      size='small'
                    />
                  </div>
                  <p className='text-muted-foreground text-lg'>
                    Crafting your personalized message...
                  </p>
                  <p className='text-sm text-gray-500 mt-2'>
                    This might take a few moments.
                  </p>
                </div>
              </Card>
            ) : generatedMessages ? (
              <>
                <div className='flex justify-between items-center'>
                  <h2 className='text-2xl font-bold text-blue-400'>
                    Generated Messages
                  </h2>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={regenerateMessages}
                    className='border-gray-700 text-blue-400 hover:bg-gray-700 hover:text-white'
                  >
                    <RefreshCw className='mr-2 h-4 w-4' /> Regenerate
                  </Button>
                </div>

                <Tabs defaultValue='concise' className='flex-grow'>
                  <TabsList className='grid w-full grid-cols-3 bg-gray-800 border border-gray-700'>
                    <TabsTrigger
                      value='concise'
                      className='data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                    >
                      Concise
                    </TabsTrigger>
                    <TabsTrigger
                      value='detailed'
                      className='data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                    >
                      Detailed
                    </TabsTrigger>
                    <TabsTrigger
                      value='follow_up'
                      className='data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                    >
                      Follow Up
                    </TabsTrigger>
                  </TabsList>

                  {/* FIX: Assert the type of the array literal */}
                  {(
                    [
                      "concise",
                      "detailed",
                      "follow_up",
                    ] as (keyof GeneratedMessage["linkedin"])[]
                  ).map((variantKey) => (
                    <TabsContent
                      key={variantKey}
                      value={variantKey}
                      className='mt-4 text-center'
                    >
                      <Card className='shadow-lg border border-white/10 bg-gray-900 text-white text-left'>
                        <CardContent className='space-y-1'>
                          <div className='flex justify-between items-start'>
                            <div className='flex items-center text-blue-400'>
                              {platform === "linkedin" ? (
                                <FiLinkedin className='h-5 w-5 mr-2' />
                              ) : (
                                <CiTwitter className='h-5 w-5 mr-2' />
                              )}
                              <span className='font-medium capitalize'>
                                {/* Safely access message using the key */}
                                {variantKey.replace("_", " ")} Variant
                              </span>
                            </div>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() =>
                                // Safely access message using the key
                                copyToClipboard(
                                  generatedMessages[platform][variantKey]
                                )
                              }
                              className='text-gray-400 hover:bg-gray-800 hover:text-white'
                            >
                              <Copy className='h-4 w-4' />
                            </Button>
                          </div>
                          <div className='whitespace-pre-wrap text-gray-300'>
                            {/* Safely access message using the key */}
                            {generatedMessages[platform][variantKey]}
                          </div>
                        </CardContent>
                      </Card>
                      <p className="text-gray-500 mt-3 italic">Made With ❤️ by <a href="https://github.com/Rithb898" target="_blank" className="text-blue-400 hover:underline">Rith</a></p>
                    </TabsContent>
                  ))}
                </Tabs>
              </>
            ) : (
              // ... (Initial Empty State Card)
              <Card className='shadow-lg border border-white/10 bg-gray-900 text-white flex flex-grow items-center justify-center min-h-[400px]'>
                <div className='text-center p-8 max-w-md'>
                  <div className='mx-auto rounded-full bg-blue-900 w-16 h-16 flex items-center justify-center mb-4'>
                    <Briefcase className='h-8 w-8 text-blue-400' />
                  </div>
                  <h3 className='text-xl font-medium mb-2 text-blue-400'>
                    Ready to Generate Your Message
                  </h3>
                  <p className='text-muted-foreground mb-6'>
                    Fill out the form on the left and click "Generate DM" to
                    craft personalized outreach messages for your job
                    application.
                  </p>
                  <div className='space-y-4 text-gray-300'>
                    <div className='flex items-start gap-3 text-left'>
                      <div className='bg-blue-900 p-2 rounded-full'>
                        <FiLinkedin className='h-4 w-4 text-blue-400' />
                      </div>
                      <div>
                        <p className='font-medium text-white'>
                          LinkedIn Example
                        </p>
                        <p className='text-sm text-gray-400'>
                          "Hi [Name], I recently applied for the [Position] role
                          at [Company]. I'd love to learn more about the team
                          and culture. Would you be open to a quick chat?"
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3 text-left'>
                      <div className='bg-blue-900 p-2 rounded-full'>
                        <CiTwitter className='h-4 w-4 text-blue-400' />
                      </div>
                      <div>
                        <p className='font-medium text-white'>
                          Twitter Example
                        </p>
                        <p className='text-sm text-gray-400'>
                          "Hi [Name]! I just applied for [Position] at
                          [Company]. Really excited about the opportunity. Any
                          chance you could share insights about the role?"
                        </p>
                        <p className="text-gray-500 mt-10 italic">Made With ❤️ by <a href="https://github.com/Rithb898" target="_blank" className="text-blue-400 hover:underline">Rith</a></p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;
