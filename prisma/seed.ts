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

  // Create nominees based on the Excel data
  const nominees = await Promise.all([
    // Most Outstanding Fisherfolk (3 nominees)
    prisma.nominee.create({
      data: {
        name: "Almujib A. Bariwa",
        location: "Bongao",
        organization: "Sin Sumangat Raayat Association",
        categoryId: categories[0].id,
        achievements:
          "Fishermen/Brgy Captain. Active member of Sin Sumangat Raayat Association.",
      },
    }),
    prisma.nominee.create({
      data: {
        name: "Kimhar A. Awali",
        location: "Panglima Sugala",
        organization: "Brgy Karaha Fisherfolk Marketing Cooperative",
        categoryId: categories[0].id,
        achievements: `1. Organizer - Brgy Karaha Fisherfolk Marketing Cooperative
2. Promotes responsible fishing and sustainable seaweed farming practices - through his initiative, the 250 sq meter seaweed nursery expanded to 2,500 sq m and still serving the constituents until today
3. The Cooperative became the lead producers and supplier of unfertilized seaweed propagules not only within neighboring barangays but also to other NGO such as Nisaul Haqq Foundation and BDA
4. In partnership with MAFAR (anglima SUgala), actively promotes good aquaculture farming practices
5. Twice invited by MAFAR Regional office as resource speaker to discuss Good Aquaculture Farming practices and their success story was featured by ICT - Regional Office during the 1st BARMM Seaweed Congress`,
      },
    }),
    prisma.nominee.create({
      data: {
        name: "Abdulqamar A. Abdulla",
        location: "Sibutu",
        organization: "Seaweed Farmer",
        categoryId: categories[0].id,
        achievements: "Most Outstanding Fisherfolk nominee from Sibutu.",
      },
    }),

    // Most Innovative Sea Farmer (2 nominees)
    prisma.nominee.create({
      data: {
        name: "Tarhata Balli",
        location: "Bongao",
        organization: "Malassa Seaweed",
        categoryId: categories[1].id,
        achievements:
          "Demonstrated exemplary performance, dedication and significant contribution to the development and advancement of seaweed farming.",
      },
    }),
    prisma.nominee.create({
      data: {
        name: "Rajum A. Karim",
        location: "Sapa-Sapa",
        organization:
          "Kasambuhan A'A Kauman Association for Sustainability, Innovations and Empowerment (KAKASIE)",
        categoryId: categories[1].id,
        achievements: `1. Proactive leadership was noticed by Government and NGO due to its community presence
2. Through his guidance, was able to address the challenges faced by the seaweed farmers (Fluctuation of prices and post harvest inefficiencies)
3. Through his leadership, the association received seaweed drying kits and start up capital to establish seaweed based enterprise
4. Was also invited to meetings and seminars particularly upstream seaweed farmers where he served as representative of his people
5. Lead the formation of KAKASIE Women Association
6. Overall, his leadership reflects strong innovation, sustainability orientation and community impact`,
      },
    }),

    // Sustainable Fisheries Champion (1 nominee)
    prisma.nominee.create({
      data: {
        name: "Shan Alimuddin",
        location: "Bongao",
        organization: "Lato Lato Seaweed Farmers Association",
        categoryId: categories[2].id,
        achievements: "Sustainable Fisheries Champion nominee. Seaweed Farmer dedicated to environmental conservation.",
      },
    }),

    // Outstanding Women in Fisheries (1 nominee)
    prisma.nominee.create({
      data: {
        name: "Edamil S. Patta",
        location: "Bongao Municipality",
        organization: "BOD: Mandulan Consumers Cooperative",
        categoryId: categories[3].id,
        achievements:
          "Fisheries/Agriculture Based Value Added Product Entrepreneur. Board of Director at Mandulan Consumers Cooperative.",
      },
    }),

    // Youth Fisheries Achiever (2 nominees)
    prisma.nominee.create({
      data: {
        name: "Rajum A. Karim",
        location: "Sapa-Sapa",
        organization:
          "President: Kasambuhan A'A Kauman Association for Sustainability, Innovations and Empowerment (KAKASIE)",
        categoryId: categories[4].id,
        achievements: `1. Actively engaged in the fisheries sector through his leadership and hands-on involvement in seaweed farming and fisheries-based livelihood. He works closely with local farmers and fisherfolk, government agencies, and development partners to address key challenges in production, post-harvest handling, and market
2. Demonstrates innovation by adopting and promoting modern and science-based fisheries practices learned from various capacity-building activities. These include improved seaweed drying methods, better post-harvest handling, and value-adding techniques supported through partnerships with agencies such as IOFM, FAO, and ITC. His openness to new technologies and adaptive practices has enabled the association to innovate its products and reduce losses among seaweed farmers
3. He exhibits strong entrepreneurial capability by initiating and managing fisheries-related enterprises aimed at stabilizing prices and increasing income for seaweed farmers. Through the establishment of the KAKASIE Seaweed Farmers' Cooperative, members were able to access start up capital, drying kits, and packaging support, enabling them to engage in collective marketing, value addition, and small-scale processing of fishery products`,
      },
    }),
    prisma.nominee.create({
      data: {
        name: "Alkimar Elias Halil",
        location: "Bongao Municipality",
        organization: "Seaweed Farmer/Student",
        categoryId: categories[4].id,
        achievements: "Youth Fisheries Achiever. Sustainable Fisheries advocate and student.",
      },
    }),

    // Additional nominee from Excel (Julaide - category unclear, placing in Sustainable Fisheries)
    prisma.nominee.create({
      data: {
        name: "Julaide B. Ladjalawi",
        location: "Simunul",
        organization: "Panglima Mastul Farmers and Fisherfolk Association",
        categoryId: categories[2].id,
        achievements: `1. Under his leadership, the association became the first in the province to pioneer abalone and mangrove nursery project
2. Advanced into agri-fishery enterprise as buyer of dried sea cucumber, creating market access for local producers. He translates knowledge gained from trainings into community practices
3. Bridges government programs with tangible livelihood, fostering sustainability, income growth and resilience among fisherfolk
4. His leadership exemplifies service-driven development in coastal communities`,
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
