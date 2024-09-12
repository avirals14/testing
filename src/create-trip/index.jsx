import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AI_PROMPT, SelectBudgetOptions, SelectTravelsList } from '@/constants/options'
import { chatSession } from '@/service/AIModel';
import React, { useEffect, useState } from "react";
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { db } from '@/service/firebaseConfig';
import { Navigation } from 'lucide-react';
import { useNavigate, useNavigation } from 'react-router-dom';





const CreateTrip = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [input, setInput] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  // List of 40 food items
  const places = [
    "Agra Fort, Agra, Uttar Pradesh",
    "Ajanta Caves, Aurangabad, Maharashtra",
    "Ellora Caves, Aurangabad, Maharashtra",
    "Taj Mahal, Agra, Uttar Pradesh",
    "Group of Monuments at Mahabalipuram, Mahabalipuram, Tamil Nadu",
    "Sun Temple, Konark, Odisha",
    "Churches and Convents of Goa, Goa",
    "Fatehpur Sikri, Fatehpur Sikri, Uttar Pradesh",
    "Group of Monuments at Hampi, Hampi, Karnataka",
    "Khajuraho Group of Monuments, Khajuraho, Madhya Pradesh",
    "Elephanta Caves, Elephanta Island, Maharashtra",
    "Great Living Chola Temples, Tamil Nadu",
    "Group of Monuments at Pattadakal, Pattadakal, Karnataka",
    "Buddhist Monuments at Sanchi, Sanchi, Madhya Pradesh",
    "Humayun's Tomb, Delhi",
    "Qutb Minar and its Monuments, Delhi",
    "Mountain Railways of India, Various (Darjeeling, Shimla, Nilgiri)",
    "Mahabodhi Temple Complex at Bodh Gaya, Bodh Gaya, Bihar",
    "Rock Shelters of Bhimbetka, Raisen District, Madhya Pradesh",
    "Chhatrapati Shivaji Terminus (formerly Victoria Terminus), Mumbai, Maharashtra",
    "Champaner-Pavagadh Archaeological Park, Pavagadh, Gujarat",
    "Red Fort Complex, Delhi",
    "The Jantar Mantar, Jaipur, Rajasthan",
    "Hill Forts of Rajasthan, Various (Chittorgarh, Kumbhalgarh, Ranthambore, Amber, Jaisalmer, Gagron)",
    "Rani-ki-Vav (The Queen’s Stepwell), Patan, Gujarat",
    "Archaeological Site of Nalanda Mahavihara, Nalanda, Bihar",
    "Historic City of Ahmedabad, Ahmedabad, Gujarat",
    "Victorian Gothic and Art Deco Ensembles of Mumbai, Mumbai, Maharashtra",
    "Jaipur City, Jaipur, Rajasthan",
    "Dholavira: A Harappan City, Dholavira, Gujarat",
    "Kakatiya Rudreshwara (Ramappa) Temple, Mulugu, Telangana",
    "Santiniketan, Birbhum District, West Bengal"
  ];


  // const handleChange = (e) => {
  //   const userInput = e.target.value;
  //   setInput(userInput);

  //   // Only show suggestions if input has at least 1 letter
  //   if (userInput.length > 0) {
  //     const filteredSuggestions = places.filter((place) => {
  //       // Split the place into site and city parts
  //       const [siteName, cityName] = place.split(',').map(part => part.trim().toLowerCase());

  //       // Check if either the site name or city name starts with the user input
  //       return siteName.startsWith(userInput.toLowerCase()) || cityName.startsWith(userInput.toLowerCase());
  //     });
  //     setSuggestions(filteredSuggestions);
  //   } else {
  //     // Clear suggestions if input is empty
  //     setSuggestions([]);
  //   }
  // };

  // Handle click on suggestion
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion); // Set input to clicked suggestion
    setSuggestions([]);   // Clear suggestions after selecting one
  };

  const [formData, setFormData] = useState([]);
  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  useEffect(() => {
    console.log(formData);
  }, [formData])

  const login = useGoogleLogin({
    onSuccess: (codeResp) => GetUserProfile(codeResp),
    onError: (error) => console.log(error)
  })

  const GetUserProfile = (tokenInfo) => {
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo?.access_token}`,
        Accept: 'Application/json'
      }
    }).then((resp) => {
      console.log(resp);
      localStorage.setItem('user', JSON.stringify(resp.data));
      setOpenDialog(false);
      OnGenerateTrip();
    })
  }

  const OnGenerateTrip = async () => {

    const user = localStorage.getItem('user');

    if (!user) {
      setOpenDialog(true);
      return;
    }

    if (!formData?.location || !formData?.budget || !formData?.traveler) {
      toast("Please fill all the details.");
      return;
    }
    else if (formData?.noOfDays > 5) {
      toast("Please enter days less than 5.")
    }

    setLoading(true);

    const FINAL_PROMPT = AI_PROMPT
      .replace('{location}', formData?.location)
      .replace('{totalDays}', formData?.noOfDays)
      .replace('{traveler}', formData?.traveler)
      .replace('{budget}', formData?.budget)
      .replace('{totalDays}', formData?.noOfDays)

    // console.log(FINAL_PROMPT);

    const result = await chatSession.sendMessage(FINAL_PROMPT);
    console.log(result?.response?.text());
    setLoading(false);
    SaveAiTrip(result?.response?.text());
  }

  const SaveAiTrip = async (TripData) => {

    setLoading(true);
    const user = JSON.parse(localStorage.getItem('user'));
    const docId = Date.now().toString();
    await setDoc(doc(db, "AITrips", docId), {
      userSelection: formData,
      tripData: JSON.parse(TripData),
      userEmail: user?.email,
      id: docId
    });
    setLoading(false);
    navigate('/view-trip/'+docId)
  }

  return (
    <div>
      <div className='sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-10'>
        <h2 className='font-bold text-3xl'>Tell us your travel preferences 🏕️🌴</h2>
        <p className='mt-3 text-gray-500 text-xl'>Just provide some basic information, and our trip planner will generate a customized itinerary based on your preferences.</p>
        <div className='mt-20 flex flex-col gap-10'>

          {/* INPUT */}
          <div>
            <h2 className='text-xl my-3 font-medium'>What is destination of choice?</h2>
            <Input
              type="text"
              value={input}
              onChange={(e) => {
                const userInput = e.target.value;
                setInput(userInput);

                // Only show suggestions if input has at least 1 letter
                if (userInput.length > 0) {
                  const filteredSuggestions = places.filter((place) => {
                    // Split the place into site and city parts
                    const [siteName, cityName] = place.split(',').map(part => part.trim().toLowerCase());

                    // Check if either the site name or city name starts with the user input
                    return siteName.startsWith(userInput.toLowerCase()) || cityName.startsWith(userInput.toLowerCase());
                  });
                  setSuggestions(filteredSuggestions);
                } else {
                  // Clear suggestions if input is empty
                  setSuggestions([]);
                }

                handleInputChange('location', e.target.value);
              }}
              placeholder="Select..."
            />

            {/* Render suggestions */}
            {suggestions.length > 0 && (
              <ul style={{ border: "1px solid #ccc", marginTop: "5px", padding: "5px" }}>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{ cursor: "pointer", listStyleType: "none", padding: "5px" }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <h2 className='text-xl my-3 font-medium'>How many days are you planning your trip?</h2>
          <Input placeholder={'Ex.3'} type="number"
            onChange={(e) => handleInputChange('noOfDays', e.target.value)}
          />
        </div>

        <div>
          <h2 className='text-xl my-3 font-medium'>What is Your Budget?</h2>
          <div className='grid grid-cols-3 gap-5 mt-5'>
            {SelectBudgetOptions.map((item, index) => (
              <div key={index}
                onClick={() => handleInputChange('budget', item.title)}
                className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg
                ${formData?.budget == item.title && 'shadow-lg border-black'}
                `}>
                <h2 className='text-4xl'>{item.icon}</h2>
                <h2 className='font-bold text-lg'>{item.title}</h2>
                <h2 className='text-sm text-gray-500'>{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className='text-xl my-3 font-medium'>Who do you plan on traveling with on your next adventure?</h2>
          <div className='grid grid-cols-3 gap-5 mt-5'>
            {SelectTravelsList.map((item, index) => (
              <div key={index}
                onClick={() => handleInputChange('traveler', item.people)}
                className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg
                  ${formData?.traveler == item.people && 'shadow-lg border-black'}
                  `}>
                <h2 className='text-4xl'>{item.icon}</h2>
                <h2 className='font-bold text-lg'>{item.title}</h2>
                <h2 className='text-sm text-gray-500'>{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>

        <div className='flex my-10 justify-end'>
          <Button
            disabled={loading}
            onClick={OnGenerateTrip} >
            {loading ?
              <AiOutlineLoading3Quarters className='w-7 h-7 animate-spin' /> : 'Generate Trip'
            }
            </Button>
        </div>

        <Dialog open={openDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogDescription>
                <img src='src\assets\logo.png' style={{ width: '15vh' }} />
                <h2 className='font-bold text-lg mt-7'>Sign In with Google</h2>
                <p>Sign In to the App with Google Authentication Securely.</p>
                <Button
                  onClick={login}
                  className='w-full mt-7 flex gap-4 items-center'>
                  <FcGoogle className='w-7 h-7' />Sign In With Google</Button>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>


      </div>
    </div>
  );
};

export default CreateTrip;