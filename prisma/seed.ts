import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.score.deleteMany();
  await prisma.nominee.deleteMany();
  await prisma.category.deleteMany();
  await prisma.judge.deleteMany();

  // Create 7 judges
  const judges = await Promise.all(
    Array.from({ length: 7 }, (_, i) =>
      prisma.judge.create({
        data: {
          code: `JUDGE-${String(i + 1).padStart(3, "0")}`,
        },
      })
    )
  );
  console.log(`Created ${judges.length} judges`);

  // Create categories with criteria
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Most Outstanding Fisherfolk of the Year",
        description:
          "Recognize exemplary performance in capture fisheries and community leadership.",
        order: 1,
        criteria: [
          {
            name: "Productivity & Efficiency",
            weight: 30,
            description: "Catch volume, consistency, income stability",
          },
          {
            name: "Compliance with Fisheries Laws",
            weight: 20,
            description: "No illegal fishing, registered gear/vessel",
          },
          {
            name: "Community Involvement",
            weight: 20,
            description: "Participation in orgs, coastal programs",
          },
          {
            name: "Sustainable Practices",
            weight: 20,
            description: "Responsible fishing methods",
          },
          {
            name: "Recognition/Endorsements",
            weight: 10,
            description: "Community/LGU support",
          },
        ],
      },
    }),
    prisma.category.create({
      data: {
        name: "Most Innovative Sea Farmer",
        description: "Highlight innovation in sea-based farming systems (Seaweed/Mariculture).",
        order: 2,
        criteria: [
          {
            name: "Innovation/Technology Adoption",
            weight: 30,
            description: "New systems (e.g., offshore baskets, improved lines)",
          },
          {
            name: "Impact on Productivity",
            weight: 25,
            description: "Yield increase, quality improvement",
          },
          {
            name: "Replicability",
            weight: 20,
            description: "Can be adopted by others",
          },
          {
            name: "Cost Efficiency",
            weight: 15,
            description: "Practical and affordable",
          },
          {
            name: "Knowledge Sharing",
            weight: 10,
            description: "Trainings, demo farms",
          },
        ],
      },
    }),
    prisma.category.create({
      data: {
        name: "Sustainable Fisheries Champion",
        description: "Reward environmental stewardship and resource conservation.",
        order: 3,
        criteria: [
          {
            name: "Environmental Stewardship",
            weight: 30,
            description: "MPA support, mangrove rehab",
          },
          {
            name: "Eco-friendly Practices",
            weight: 25,
            description: "Gear selectivity, low impact",
          },
          {
            name: "Advocacy & Education",
            weight: 20,
            description: "Awareness campaigns",
          },
          {
            name: "Partnerships & Collaboration",
            weight: 15,
            description: "Work with LGUs/NGOs",
          },
          {
            name: "Measurable Impact",
            weight: 10,
            description: "Documented outcomes",
          },
        ],
      },
    }),
    prisma.category.create({
      data: {
        name: "Outstanding Women in Fisheries & Aquaculture",
        description: "Recognize the role and leadership of women in the sector.",
        order: 4,
        criteria: [
          {
            name: "Contribution to Production",
            weight: 30,
            description: "Fisheries/aqua outputs",
          },
          {
            name: "Leadership & Influence",
            weight: 25,
            description: "Role in org/community",
          },
          {
            name: "Innovation/Livelihood Diversification",
            weight: 20,
            description: "New income streams",
          },
          {
            name: "Gender Advocacy",
            weight: 15,
            description: "Empowerment efforts",
          },
          {
            name: "Social Impact",
            weight: 10,
            description: "Community benefits",
          },
        ],
      },
    }),
    prisma.category.create({
      data: {
        name: "Youth Fisheries Achiever",
        description:
          "Encourage young leaders in fisheries and sea-based enterprises (18-35 years old).",
        order: 5,
        criteria: [
          {
            name: "Engagement in Fisheries Sector",
            weight: 25,
            description: "Active involvement",
          },
          {
            name: "Innovation & Modern Practices",
            weight: 25,
            description: "Digital tools, new methods",
          },
          {
            name: "Entrepreneurship",
            weight: 20,
            description: "Value-adding, marketing",
          },
          {
            name: "Leadership Potential",
            weight: 15,
            description: "Initiative, influence",
          },
          {
            name: "Sustainability Orientation",
            weight: 15,
            description: "Eco-conscious practices",
          },
        ],
      },
    }),
  ]);
  console.log(`Created ${categories.length} categories`);

  // Create nominees based on the corrected data
  const nominees = await Promise.all([
    // 1. Most Outstanding Fisherfolk - Almujib A. Bariwa
    prisma.nominee.create({
      data: {
        name: "Almujib A. Bariwa",
        location: "Bongao",
        organization: "President: Kasambuhan Sin Sumangat Raayat Association",
        categoryId: categories[0].id,
        achievements: "Fishermen/Brgy Captain. President of Kasambuhan Sin Sumangat Raayat Association.",
      },
    }),
    // 2. Most Outstanding Fisherfolk - Kimhar A. Awali
    prisma.nominee.create({
      data: {
        name: "Kimhar A. Awali",
        location: "Panglima Sugala",
        organization: "President: Brgy Karaha Fisherfolk Marketing Cooperative",
        categoryId: categories[0].id,
        achievements: `1. Organizer - Brgy Karaha Fisherfolk Marketing Cooperative
2. Promotes responsible fishing and sustainable seaweed farming practices - through his initiative, the 250 sq meter seaweed nursery expanded to 2,500 sq m and still serving the constituents until today
3. The Cooperative became the lead producers and supplier of unfertilized seaweed propagules not only within neighboring barangays but also to other NGO such as Nisaul Haqq Foundation and BDA
4. In partnership with MAFAR - Panglima Sugala, actively promotes good aquaculture farming practices
5. Twice invited by MAFAR Regional office as resource speaker to discuss Good Aquaculture Farming practices and their success story was featured by ICT - Regional Office during the 1st BARMM Seaweed Congress`,
      },
    }),
    // 3. Most Outstanding Fisherfolk - Abdulgamar A. Abdulla
    prisma.nominee.create({
      data: {
        name: "Abdulgamar A. Abdulla",
        location: "Sibutu",
        organization: "Seaweed Farmer",
        categoryId: categories[0].id,
        achievements: `As a pioneering seaweed nursery operator in west Sibutu, he successfully scaled up production by increasing the number of lines. Notably, he is the first and only seaweed operator to systematically distribute a total of 750 lines high quality seaweed seedlings taken from the nursery for free (30% MAFAR's share).

Serving as the leader of the Mohd. Seaweed Farmers, he established a highly effective Bayanihan System. He effectively addresses the community's lack of post harvest facilities by generously lending his own seaweed drier (AKA Pantan, used for seedling preparation and drying). Under his leadership, a highly synchronized, rotational Bayanihan System is practiced.`,
      },
    }),

    // 4. Most Innovative Sea Farmer - Tarhatta Bakki
    prisma.nominee.create({
      data: {
        name: "Tarhatta Bakki",
        location: "Bongao",
        organization: "Malassa Seaweed Farmers Association",
        categoryId: categories[1].id,
        achievements: "Demonstrated exemplary performance, dedication and significant contribution to the development and advancement of the fisheries sector in the municipality.",
      },
    }),
    // 5. Most Innovative Sea Farmer - Rajum A. Karim
    prisma.nominee.create({
      data: {
        name: "Rajum A. Karim",
        location: "Sapa-Sapa",
        organization: "President: Kasambuhan A'A Kauman Association for Sustainability, Innovations and Empowerment (KAKASIE)",
        categoryId: categories[1].id,
        achievements: `1. Proactive leadership was noticed by Government and NGO due to its community presence
2. Through his guidance, was able to address the challenges faced by the seaweed farmers (Fluctuation of prices and post harvest inefficiencies)
3. Through his leadership, the association received seaweed drying kits and start up capital to establish seaweed based enterprise
4. Was also invited to meetings and seminars particularly upstream seaweed farmers where he served as representative of his people
5. Lead the formation of KAKASIE Women Association
6. Overall, his leadership reflects strong innovation, sustainability orientation and community impact`,
      },
    }),
    // 6. Most Innovative Sea Farmer - Abdulgamar A. Abdulla
    prisma.nominee.create({
      data: {
        name: "Abdulgamar A. Abdulla",
        location: "Sibutu",
        organization: "Seaweed Farmer",
        categoryId: categories[1].id,
        achievements: `As a pioneering seaweed nursery operator in west Sibutu, he successfully scaled up production by increasing the number of lines. Notably, he is the first and only seaweed operator to systematically distribute a total of 750 lines high quality seaweed seedlings taken from the nursery for free (30% MAFAR's share).

Serving as the leader of the Mohd. Seaweed Farmers, he established a highly effective Bayanihan System. He effectively addresses the community's lack of post harvest facilities by generously lending his own seaweed drier (AKA Pantan, used for seedling preparation and drying). Under his leadership, a highly synchronized, rotational Bayanihan System is practiced. Seaweed farmers work sequentially; when the first farmer is scheduled to harvest the other members actively gather to help them in the preparation of seedlings for the succeeding cropping then it follows to the other members.`,
      },
    }),

    // 7. Sustainable Fisheries Champion - Julaide B. Ladjalawi
    prisma.nominee.create({
      data: {
        name: "Julaide B. Ladjalawi",
        location: "Simunul",
        organization: "President: Raayat Panglima Mastul Farmers and Fisherfolk Association",
        categoryId: categories[2].id,
        achievements: `1. Under his leadership, the association became the first in the province to pioneer abalone and mangrove nursery project
2. Advanced into agri-fishery enterprise as buyer of dried sea cucumber, creating market access for local producers. He translates knowledge gained from trainings into community practices
3. Bridges government programs with tangible livelihood, fostering sustainability, income growth and resilience among fisherfolk
4. His leadership exemplifies service-driven development in coastal communities`,
      },
    }),
    // 8. Sustainable Fisheries Champion - Shan Alimuddin
    prisma.nominee.create({
      data: {
        name: "Shan Alimuddin",
        location: "Bongao",
        organization: "Lato Lato Seaweed Farmers Association",
        categoryId: categories[2].id,
        achievements: "Seaweed Farmer. Member of Lato Lato Seaweed Farmers Association.",
      },
    }),

    // 9. Outstanding Women in Fisheries & Aquaculture - Edamil S. Patta
    prisma.nominee.create({
      data: {
        name: "Edamil S. Patta",
        location: "Bongao Municipality",
        organization: "BOD: Mandulan Consumers Cooperative",
        categoryId: categories[3].id,
        achievements: "Fisheries/Agriculture Based Value Added Product Entrepreneur. Board of Director at Mandulan Consumers Cooperative.",
      },
    }),

    // 10. Youth Fisheries Achiever - Rajum A. Karim
    prisma.nominee.create({
      data: {
        name: "Rajum A. Karim",
        location: "Sapa-Sapa",
        organization: "President: Kasambuhan A'A Kauman Association for Sustainability, Innovations and Empowerment (KAKASIE)",
        categoryId: categories[4].id,
        achievements: `1. Actively engaged in the fisheries sector through his leadership and hands-on involvement in seaweed farming and fisheries-based livelihood. He works closely with local farmers and fisherfolk, government agencies, and development partners to address key challenges in production, post-harvest handling, and market
2. Demonstrates innovation by adopting and promoting modern and science-based fisheries practices learned from various capacity-building activities. These include improved seaweed drying methods, better post-harvest handling, and value-adding techniques supported through partnerships with agencies such as IOM, FAO, and ITC. His openness to new technologies and adaptive practices has enabled the association to innovate its products and reduce losses among seaweed farmers
3. He exhibits strong entrepreneurial capability by initiating and managing fisheries-related enterprises aimed at stabilizing prices and increasing income for seaweed farmers. Through the establishment of the KAKASIE Seaweed Farmers' Cooperative, members were able to access start up capital, drying kits, and packaging support, enabling them to engage in collective marketing, value addition, and small-scale processing of fishery products`,
      },
    }),
    // 11. Youth Fisheries Achiever - Alkimar Elias Halil
    prisma.nominee.create({
      data: {
        name: "Alkimar Elias Halil",
        location: "Bongao Municipality",
        organization: "Seaweed Farmer/Student",
        categoryId: categories[4].id,
        achievements: "Seaweed Farmer and Student.",
      },
    }),
  ]);
  console.log(`Created ${nominees.length} nominees`);

  console.log("Seed completed successfully!");
  console.log("\nJudge codes:");
  judges.forEach((j) => console.log(`  ${j.code}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
