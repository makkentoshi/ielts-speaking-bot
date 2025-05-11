export const IELTS_TOPICS = [
  "Work",
  "Study",
  "Hometown",
  "Family",
  "Friends",
  "Food",
  "Travel",
  "Sports",
  "Music",
  "Movies",
  "Books",
  "Technology",
  "Health",
  "Shopping",
  "Environment",
  "Art",
  "Daily Routine",
  "Weather",
  "Future Plans",
  "Hobbies",
] as const;

export type IeltsTopic = (typeof IELTS_TOPICS)[number];

export interface TopicQuestions {
  part1: string[];
  part2: string;
  part3: string[];
}

export const QUESTIONS: Record<IeltsTopic, TopicQuestions> = {
  Work: {
    part1: [
      "What do you do for a living?",
      "Why did you choose this profession?",
      "What do you like most about your job?",
      "Do you prefer working alone or in a team?",
    ],
    part2:
      "Describe your dream job. You should say: what it is, what skills it requires, why you would enjoy it, and how it differs from your current job.",
    part3: [
      "How has technology changed workplaces in your country?",
      "What skills will be important for jobs in the future?",
      "Is job satisfaction more important than a high salary?",
    ],
  },
  Study: {
    part1: [
      "What are you studying at the moment?",
      "Why did you choose this subject or course?",
      "What do you find challenging about studying?",
      "Do you prefer studying in the morning or evening?",
    ],
    part2:
      "Describe a subject you enjoyed studying. You should say: what it was, how you studied it, why you enjoyed it, and how it has helped you.",
    part3: [
      "How important is education for success in life?",
      "Should schools focus more on practical skills?",
      "How can technology improve education?",
    ],
  },
  Hometown: {
    part1: [
      "Where is your hometown located?",
      "What do you like about your hometown?",
      "Has your hometown changed much in recent years?",
      "Would you like to live in your hometown in the future?",
    ],
    part2:
      "Describe your hometown. You should say: where it is, what it is like, what you like about it, and how it has influenced you.",
    part3: [
      "What are the advantages of living in a small town compared to a city?",
      "How do cities in your country differ from rural areas?",
      "Should people stay in their hometowns or move to bigger cities?",
    ],
  },
  Family: {
    part1: [
      "How many people are there in your family?",
      "Do you spend a lot of time with your family?",
      "Who are you closest to in your family?",
      "What activities do you do together as a family?",
    ],
    part2:
      "Describe a family member you admire. You should say: who they are, what they do, why you admire them, and how they have influenced you.",
    part3: [
      "How have family roles changed in your country?",
      "Is it better to grow up in a large family or a small one?",
      "How important is family in your culture?",
    ],
  },
  Friends: {
    part1: [
      "How often do you meet your friends?",
      "What do you usually do with your friends?",
      "How did you meet your best friend?",
      "Do you prefer having many friends or a few close ones?",
    ],
    part2:
      "Describe a close friend. You should say: how you met, what you do together, what you like about them, and why they are important to you.",
    part3: [
      "How do friendships change as people get older?",
      "Is it easier to make friends today than in the past?",
      "What role do friends play in people's lives?",
    ],
  },
  Food: {
    part1: [
      "What kind of food do you enjoy eating?",
      "Do you prefer eating at home or in restaurants?",
      "Are there any foods you don't like?",
      "How often do you try new foods?",
    ],
    part2:
      "Describe a memorable meal you had. You should say: what the meal was, where you had it, who you were with, and why it was memorable.",
    part3: [
      "How have eating habits changed in your country?",
      "Is healthy eating important in your culture?",
      "Should restaurants provide healthier menu options?",
    ],
  },
  Travel: {
    part1: [
      "Do you enjoy traveling?",
      "What is the best place you have visited?",
      "Do you prefer traveling alone or with others?",
      "What do you usually do when you travel?",
    ],
    part2:
      "Describe a place you have visited. You should say: where it is, what you did there, why you went there, and how you felt about it.",
    part3: [
      "What are the benefits of traveling abroad?",
      "How does tourism affect local communities?",
      "Should governments encourage tourism?",
    ],
  },
  Sports: {
    part1: [
      "Do you like playing sports?",
      "What sports are popular in your country?",
      "Did you play sports when you were younger?",
      "How often do you watch sports?",
    ],
    part2:
      "Describe a sport you enjoy. You should say: what it is, how it is played, why you enjoy it, and how it benefits you.",
    part3: [
      "Why do some people prefer watching sports to playing them?",
      "Should schools make sports compulsory?",
      "How do sports events unite people?",
    ],
  },
  Music: {
    part1: [
      "What kind of music do you listen to?",
      "Do you play any musical instruments?",
      "How often do you listen to music?",
      "Has your taste in music changed over time?",
    ],
    part2:
      "Describe a song you like. You should say: what the song is, who sings it, why you like it, and when you first heard it.",
    part3: [
      "How does music affect people's emotions?",
      "Is live music better than recorded music?",
      "Should music education be part of school curriculums?",
    ],
  },
  Movies: {
    part1: [
      "How often do you watch movies?",
      "What type of movies do you enjoy?",
      "Do you prefer watching movies at home or in a cinema?",
      "Who do you usually watch movies with?",
    ],
    part2:
      "Describe a movie you enjoyed. You should say: what it was, what it was about, why you liked it, and how it affected you.",
    part3: [
      "How have movies changed over the years?",
      "Do movies influence people's behavior?",
      "Should governments censor movies?",
    ],
  },
  Books: {
    part1: [
      "Do you enjoy reading books?",
      "What type of books do you read?",
      "When do you usually read?",
      "Did you read a lot as a child?",
    ],
    part2:
      "Describe a book you have read. You should say: what it is, what it is about, why you read it, and how it affected you.",
    part3: [
      "Why do some people prefer e-books over printed books?",
      "How can reading benefit young people?",
      "Should schools encourage more reading?",
    ],
  },
  Technology: {
    part1: [
      "What kind of technology do you use daily?",
      "Do you enjoy learning about new technology?",
      "Has technology made your life easier?",
      "Are you good at using computers?",
    ],
    part2:
      "Describe a piece of technology you find useful. You should say: what it is, how you use it, why it is useful, and how it has changed your life.",
    part3: [
      "How has technology changed communication?",
      "What are the disadvantages of relying on technology?",
      "Should children have access to technology at a young age?",
    ],
  },
  Health: {
    part1: [
      "How do you keep yourself healthy?",
      "Do you think you have a healthy diet?",
      "How often do you exercise?",
      "What do you do when you feel unwell?",
    ],
    part2:
      "Describe a time you were unwell. You should say: what happened, how you felt, what you did, and how you recovered.",
    part3: [
      "How can governments promote healthy lifestyles?",
      "Is healthcare free in your country?",
      "Should schools teach children about health?",
    ],
  },
  Shopping: {
    part1: [
      "Do you enjoy shopping?",
      "What kind of things do you usually buy?",
      "Do you prefer shopping online or in stores?",
      "How often do you go shopping?",
    ],
    part2:
      "Describe a shopping experience you had. You should say: where you went, what you bought, why you went there, and how you felt about it.",
    part3: [
      "How has online shopping changed consumer behavior?",
      "Should people buy local products instead of imported ones?",
      "What are the environmental impacts of shopping?",
    ],
  },
  Environment: {
    part1: [
      "Do you care about the environment?",
      "What environmental problems are common in your country?",
      "Do you recycle or reuse things?",
      "How do you help protect the environment?",
    ],
    part2:
      "Describe an environmental problem you know about. You should say: what it is, what causes it, how it affects people, and what can be done about it.",
    part3: [
      "Who is responsible for protecting the environment?",
      "How can governments encourage recycling?",
      "Is climate change a serious issue in your country?",
    ],
  },
  Art: {
    part1: [
      "Do you enjoy art?",
      "Have you ever visited an art gallery?",
      "What kind of art do you like?",
      "Did you do art activities as a child?",
    ],
    part2:
      "Describe a piece of art you like. You should say: what it is, where you saw it, why you like it, and how it makes you feel.",
    part3: [
      "Why is art important in society?",
      "Should art be taught in schools?",
      "How has modern art changed over time?",
    ],
  },
  Weather: {
    part1: [
      "What is the weather like in your country?",
      "Do you prefer hot or cold weather?",
      "How does the weather affect your mood?",
      "What activities do you do in different weather?",
    ],
    part2:
      "Describe a time when the weather affected your plans. You should say: what happened, what the weather was like, how it affected you, and what you did instead.",
    part3: [
      "How does weather impact people's lives?",
      "Should governments prepare for extreme weather?",
      "Is weather forecasting reliable in your country?",
    ],
  },
  Hobbies: {
    part1: [
      "What hobbies do you have?",
      "How did you start your favorite hobby?",
      "How much time do you spend on your hobbies?",
      "Do you prefer active or relaxing hobbies?",
    ],
    part2:
      "Describe a hobby you enjoy. You should say: what it is, how you do it, why you enjoy it, and how it benefits you.",
    part3: [
      "Why do people need hobbies?",
      "How have hobbies changed with technology?",
      "Should hobbies be expensive?",
    ],
  },
  "Daily Routine": {
    part1: [
      "What is your typical daily routine?",
      "Do you prefer morning or evening activities?",
      "How has your routine changed over time?",
      "What part of your day do you enjoy most?",
    ],
    part2:
      "Describe your daily routine. You should say: what you do, when you do it, why you follow this routine, and how it helps you.",
    part3: [
      "How do people's routines differ between weekdays and weekends?",
      "Is it important to have a regular routine?",
      "How has technology changed daily routines?",
    ],
  },
  "Future Plans": {
    part1: [
      "What are your plans for the future?",
      "Where do you see yourself in five years?",
      "What goals do you want to achieve?",
      "How do you plan to achieve your goals?",
    ],
    part2:
      "Describe your future plans. You should say: what they are, why you have these plans, how you will achieve them, and how they might change.",
    part3: [
      "How important is it to plan for the future?",
      "Should people focus more on short-term or long-term goals?",
      "How can people prepare for an uncertain future?",
    ],
  },
};
