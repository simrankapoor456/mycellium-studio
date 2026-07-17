const state = {
  plan: null,
  statusById: {},
};

const sampleBrief = `I want to build mycellium studio, a calm project planning tool where someone can paste a rough software project idea and get grounded scope, epics, user stories, developer tasks, sprint allocation, risks, missing requirements, and exportable Markdown/JSON/CSV. The tool should feel organized, warm, professional, women-led, and should not require paid n8n.`;

const owners = ["product", "design", "frontend", "backend", "fullstack", "qa", "devops", "data"];

const dom = {
  projectBrief: document.querySelector("#projectBrief"),
  projectName: document.querySelector("#projectName"),
  projectType: document.querySelector("#projectType"),
  teamSize: document.querySelector("#teamSize"),
  sprintLength: document.querySelector("#sprintLength"),
  capacity: document.querySelector("#capacity"),
  planningDepth: document.querySelector("#planningDepth"),
  loadSample: document.querySelector("#loadSample"),
  generatePlan: document.querySelector("#generatePlan"),
  overviewContent: document.querySelector("#overviewContent"),
  qualityBadge: document.querySelector("#qualityBadge"),
  epicList: document.querySelector("#epicList"),
  storyList: document.querySelector("#storyList"),
  taskList: document.querySelector("#taskList"),
  sprintList: document.querySelector("#sprintList"),
  reviewList: document.querySelector("#reviewList"),
  exportPreview: document.querySelector("#exportPreview"),
  copyMarkdown: document.querySelector("#copyMarkdown"),
  downloadMarkdown: document.querySelector("#downloadMarkdown"),
  downloadJson: document.querySelector("#downloadJson"),
  downloadCsv: document.querySelector("#downloadCsv"),
  searchFilter: document.querySelector("#searchFilter"),
  priorityFilter: document.querySelector("#priorityFilter"),
  ownerFilter: document.querySelector("#ownerFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  toast: document.querySelector("#toast"),
  charCount: document.querySelector(".char-count"),
  healthScore: document.querySelector("#healthScore"),
};

dom.loadSample.addEventListener("click", () => {
  dom.projectName.value = "mycellium studio";
  dom.projectType.value = "AI product";
  dom.teamSize.value = "3";
  dom.capacity.value = "24";
  dom.projectBrief.value = sampleBrief;
  updateCharCount();
  showToast("Sample loaded.");
});

dom.projectBrief.addEventListener("input", updateCharCount);

dom.generatePlan.addEventListener("click", () => {
  const brief = dom.projectBrief.value.trim();

  if (!brief) {
    showToast("Add a project idea first.");
    dom.projectBrief.focus();
    return;
  }

  state.plan = generatePlan({
    brief,
    projectName: dom.projectName.value.trim() || inferProjectName(brief),
    projectType: dom.projectType.value,
    teamSize: Number(dom.teamSize.value || 1),
    sprintLength: dom.sprintLength.value,
    capacity: Number(dom.capacity.value || 20),
    planningDepth: dom.planningDepth.value,
  });

  state.statusById = {};
  for (const story of getStories(state.plan)) {
    state.statusById[story.story_id] = story.needs_review ? "review" : "ready";
  }
  for (const task of getTasks(state.plan)) {
    state.statusById[task.task_id] = task.needs_review ? "review" : "ready";
  }

  renderPlan();
  showToast("Plan shaped.");
});

[dom.searchFilter, dom.priorityFilter, dom.ownerFilter, dom.statusFilter].forEach((control) => {
  control.addEventListener("input", renderPlan);
});

dom.copyMarkdown.addEventListener("click", async () => {
  if (!state.plan) return showToast("Generate a plan first.");
  const markdown = toMarkdown(state.plan);

  try {
    await navigator.clipboard.writeText(markdown);
  } catch {
    dom.exportPreview.value = markdown;
    dom.exportPreview.focus();
    dom.exportPreview.select();
    document.execCommand("copy");
  }

  showToast("Markdown copied.");
});

dom.downloadMarkdown.addEventListener("click", () => {
  if (!state.plan) return showToast("Generate a plan first.");
  downloadFile(`${slugify(state.plan.project_name)}-mycellium.md`, toMarkdown(state.plan), "text/markdown");
});

dom.downloadJson.addEventListener("click", () => {
  if (!state.plan) return showToast("Generate a plan first.");
  downloadFile(`${slugify(state.plan.project_name)}-mycellium.json`, JSON.stringify(state.plan, null, 2), "application/json");
});

dom.downloadCsv.addEventListener("click", () => {
  if (!state.plan) return showToast("Generate a plan first.");
  downloadFile(`${slugify(state.plan.project_name)}-tasks.csv`, toCsv(state.plan), "text/csv");
});

function generatePlan(input) {
  const keywords = extractKeywords(input.brief);
  const projectNoun = keywords[0] || "product";
  const features = inferFeatures(input.brief, input.planningDepth);
  const goals = [
    `Turn the ${projectNoun} idea into a usable first release.`,
    "Keep the experience simple enough for a first-time user to complete without training.",
    "Create a steady backbone of work that can be reviewed before anything is published to another tool.",
  ];
  const assumptions = [
    `The first release is focused on a ${input.projectType.toLowerCase()} MVP.`,
    `A team of ${input.teamSize} can review, care for, and adjust the plan before execution starts.`,
    "External integrations are optional until the generated plan quality is proven.",
  ];
  const missing = inferMissingRequirements(input.brief);
  const epics = buildEpics(features, input.brief);
  const sprints = allocateSprints(epics, input.capacity, input.sprintLength);
  const risks = buildRisks(missing, input.brief);
  const review = buildReview(epics, missing, risks);

  return {
    project_name: input.projectName,
    project_summary: summarizeBrief(input.brief, input.projectName),
    project_type: input.projectType,
    business_objective: `Validate that ${input.projectName} can turn early project uncertainty into calm, organized execution.`,
    target_users: inferUsers(input.brief),
    goals,
    assumptions,
    constraints: [
      "No paid workflow subscription required for the MVP.",
      "Human approval is required before using outputs in external tools.",
      "The first version should be deployable as a lightweight web app.",
    ],
    missing_requirements: missing,
    risks,
    epics,
    sprints,
    review,
    exports: {
      markdown_summary: "",
      jira_ready: getStories({ epics }).map((story) => ({
        issue_type: "Story",
        summary: story.story_title,
        description: story.user_story,
        priority: story.priority,
        estimate_points: story.estimate_points,
      })),
      trello_ready: getStories({ epics }).map((story) => ({
        card_name: story.story_title,
        list: story.priority === "high" ? "Sprint 1" : "Backlog",
        description: story.user_story,
      })),
    },
  };
}

function inferFeatures(brief, depth) {
  const lower = brief.toLowerCase();
  const featureBank = [
    { key: "auth", name: "Account and Access", terms: ["login", "signup", "account", "user", "profile", "auth"] },
    { key: "input", name: "Project Intake", terms: ["input", "paste", "brief", "idea", "form", "upload"] },
    { key: "planning", name: "Planning Engine", terms: ["plan", "epic", "story", "task", "sprint", "estimate"] },
    { key: "review", name: "Human Review", terms: ["review", "approve", "edit", "regenerate", "quality"] },
    { key: "export", name: "Export and Sharing", terms: ["export", "jira", "trello", "markdown", "json", "csv", "download"] },
    { key: "analytics", name: "Insights and History", terms: ["dashboard", "history", "analytics", "save", "track"] },
    { key: "notifications", name: "Notifications", terms: ["reminder", "email", "notify", "alert"] },
    { key: "data", name: "Data and Storage", terms: ["database", "storage", "save", "sync"] },
  ];

  const matched = featureBank.filter((feature) => feature.terms.some((term) => lower.includes(term)));
  const defaults = [
    featureBank.find((feature) => feature.key === "input"),
    featureBank.find((feature) => feature.key === "planning"),
    featureBank.find((feature) => feature.key === "review"),
    featureBank.find((feature) => feature.key === "export"),
  ];
  const merged = uniqueBy([...matched, ...defaults], "key");
  const limit = depth === "lean" ? 4 : depth === "detailed" ? 6 : 5;
  return merged.slice(0, limit);
}

function buildEpics(features, brief) {
  return features.map((feature, epicIndex) => {
    const epicId = `EPIC-${epicIndex + 1}`;
    const priority = epicIndex < 2 ? "high" : epicIndex < 4 ? "medium" : "low";
    const stories = buildStoriesForFeature(feature, epicId, priority, brief);

    return {
      epic_id: epicId,
      epic_name: feature.name,
      description: describeEpic(feature.name),
      priority,
      stories,
    };
  });
}

function buildStoriesForFeature(feature, epicId, epicPriority, brief) {
  const storyTemplates = {
    "Project Intake": [
      ["Submit a project brief", "As a planner, I want to enter a rough idea so that mycellium studio can understand what I am trying to build."],
      ["Configure planning settings", "As a planner, I want to set team size, sprint length, and project type so that the generated plan fits my situation."],
    ],
    "Planning Engine": [
      ["Generate epics and stories", "As a planner, I want mycellium studio to break the idea into epics and stories so that I can see the product scope clearly."],
      ["Create developer tasks", "As an engineer, I want stories translated into tasks so that implementation work is easier to start."],
    ],
    "Human Review": [
      ["Review plan quality", "As a planner, I want mycellium studio to flag unclear items so that I can fix the plan before the team uses it."],
      ["Edit generated work items", "As a planner, I want to edit epics, stories, and tasks so that the final plan reflects human judgment."],
    ],
    "Export and Sharing": [
      ["Export a readable plan", "As a planner, I want to download Markdown and JSON so that I can share the plan with a team or another tool."],
      ["Prepare tool-ready issues", "As a planner, I want a Jira-style issue format so that future integrations are easier."],
    ],
    "Account and Access": [
      ["Create a workspace", "As a user, I want a workspace so that my project plans are organized."],
      ["Manage project access", "As an owner, I want to decide who can view or edit a plan so that work stays controlled."],
    ],
    "Insights and History": [
      ["View saved plans", "As a planner, I want to revisit old plans so that I can compare planning decisions over time."],
      ["Track planning quality", "As a planner, I want quality signals so that I know whether the generated work is ready."],
    ],
    "Notifications": [
      ["Send review reminders", "As a team lead, I want reminders so that plan reviews do not get forgotten."],
      ["Notify export completion", "As a planner, I want confirmation when exports are ready so that I know the handoff worked."],
    ],
    "Data and Storage": [
      ["Save generated plans", "As a planner, I want plans saved so that I can return to them later."],
      ["Store structured work items", "As a developer, I want structured data so that future integrations can reuse the output."],
    ],
  };

  return (storyTemplates[feature.name] || storyTemplates["Planning Engine"]).map((template, storyIndex) => {
    const storyNumber = Number(epicId.replace("EPIC-", "")) * 10 + storyIndex + 1;
    const estimate = storyIndex === 0 ? 5 : 3;
    const needsReview = storyNeedsReview(template[0], brief);

    return {
      story_id: `STORY-${storyNumber}`,
      story_title: template[0],
      user_story: template[1],
      acceptance_criteria: buildAcceptanceCriteria(template[0], needsReview),
      priority: epicPriority,
      estimate_points: needsReview ? estimate + 2 : estimate,
      dependencies: storyIndex === 0 ? [] : [`STORY-${storyNumber - 1}`],
      needs_review: needsReview,
      tasks: buildTasks(template[0], `STORY-${storyNumber}`, needsReview),
    };
  });
}

function buildTasks(storyTitle, storyId, needsReview) {
  const base = [
    ["Define expected behavior", "product", "Clarify the user outcome, edge cases, and done state."],
    ["Design the interaction", "design", "Create the screen or flow needed for the story."],
    ["Build the experience", "frontend", "Implement the visible user experience."],
    ["Connect data and logic", "backend", "Handle state, validation, persistence, or API behavior."],
    ["Test acceptance criteria", "qa", "Verify the story works against the agreed criteria."],
  ];

  return base.map((task, index) => ({
    task_id: `${storyId}-TASK-${index + 1}`,
    task_title: `${task[0]}: ${storyTitle}`,
    description: task[2],
    owner_type: task[1],
    subtasks: index === 4 ? ["Check happy path", "Check missing input", "Check mobile layout"] : [],
    dependency: index > 1 ? `${storyId}-TASK-${index}` : "",
    needs_review: needsReview && index < 2,
  }));
}

function allocateSprints(epics, capacity, sprintLength) {
  const stories = getStories({ epics });
  const sprints = [];
  let sprint = newSprint(1, sprintLength, capacity);

  for (const story of stories) {
    if (sprint.allocated_points + story.estimate_points > capacity && sprint.stories.length > 0) {
      sprints.push(sprint);
      sprint = newSprint(sprints.length + 1, sprintLength, capacity);
    }

    sprint.allocated_points += story.estimate_points;
    sprint.stories.push({
      story_id: story.story_id,
      story_title: story.story_title,
      reason: story.priority === "high" ? "High-priority foundation work." : "Fits after the core flow is stable.",
    });
  }

  sprints.push(sprint);
  return sprints.map((item) => ({
    ...item,
    risks: item.allocated_points > capacity * 0.85 ? ["Sprint is near capacity; keep new work from overgrowing the plan."] : [],
  }));
}

function newSprint(index, duration, capacity) {
  return {
    sprint_id: `SPRINT-${index}`,
    sprint_name: `Sprint ${index}`,
    goal: index === 1 ? "Prove the core planning backbone end to end." : "Strengthen quality, review, export, and usability.",
    duration,
    capacity_points: capacity,
    allocated_points: 0,
    stories: [],
    risks: [],
  };
}

function buildReview(epics, missing, risks) {
  const stories = getStories({ epics });
  const oversized = stories.filter((story) => story.estimate_points >= 8).map((story) => story.story_id);
  const unclear = stories.filter((story) => story.needs_review).map((story) => story.story_id);
  const score = Math.max(62, 94 - missing.length * 5 - oversized.length * 6 - unclear.length * 3 - risks.length * 2);

  return {
    quality_score: score,
    duplicate_story_warnings: [],
    missing_acceptance_criteria: [],
    oversized_stories: oversized,
    unsupported_assumptions: missing.length ? ["Some planning choices are inferred from the brief and need confirmation."] : [],
    clarifying_questions: [
      ...missing.map((item) => `Please confirm: ${item}`),
      "Who is the first target user for the MVP?",
      "What must be included in Sprint 1 for the demo to feel successful?",
    ].slice(0, 5),
  };
}

function buildRisks(missing, brief) {
  const risks = [
    {
      risk: "Generated scope may overgrow the first release.",
      impact: "medium",
      mitigation: "Keep Sprint 1 rooted in the core brief, scope, review, and export loop.",
    },
  ];

  if (missing.length) {
    risks.push({
      risk: "Missing requirements could cause rework.",
      impact: "medium",
      mitigation: "Answer the review questions before assigning work.",
    });
  }

  if (brief.toLowerCase().includes("integration") || brief.toLowerCase().includes("jira")) {
    risks.push({
      risk: "External integrations can slow down the MVP.",
      impact: "high",
      mitigation: "Export structured files first, then add direct publishing later.",
    });
  }

  return risks;
}

function inferMissingRequirements(brief) {
  const lower = brief.toLowerCase();
  const missing = [];

  if (!lower.includes("user") && !lower.includes("customer") && !lower.includes("team")) {
    missing.push("target user");
  }
  if (!lower.includes("export") && !lower.includes("download") && !lower.includes("share")) {
    missing.push("handoff or export format");
  }
  if (!lower.includes("deadline") && !lower.includes("sprint") && !lower.includes("week")) {
    missing.push("timeline or delivery target");
  }
  if (!lower.includes("success") && !lower.includes("goal") && !lower.includes("useful")) {
    missing.push("success metric");
  }

  return missing;
}

function renderPlan() {
  if (!state.plan) return;

  renderOverview();
  renderEpics();
  renderStories();
  renderTasks();
  renderSprints();
  renderReview();
  dom.exportPreview.value = toMarkdown(state.plan);
}

function renderOverview() {
  const plan = state.plan;
  dom.qualityBadge.textContent = `${plan.review.quality_score}% quality`;
  if (dom.healthScore) dom.healthScore.textContent = `${plan.review.quality_score}%`;
  dom.overviewContent.className = "overview-grid";
  dom.overviewContent.innerHTML = [
    infoBlock("Summary", `<p>${escapeHtml(plan.project_summary)}</p>`),
    infoBlock("Goals", list(plan.goals)),
    infoBlock("Assumptions", list(plan.assumptions)),
    infoBlock("Missing Details", list(plan.missing_requirements.length ? plan.missing_requirements : ["No major missing details flagged."])),
    infoBlock("Constraints", list(plan.constraints)),
    infoBlock("Risks", list(plan.risks.map((risk) => `${risk.risk} ${risk.mitigation}`))),
  ].join("");
}

function renderEpics() {
  const epics = state.plan.epics.filter(matchesEpicFilters);
  dom.epicList.innerHTML = epics.map((epic) => `
    <article class="item-card" data-priority="${epic.priority}">
      <div class="item-card-head">
        <div>
          <p class="item-kicker">${epic.epic_id}</p>
          <h3 contenteditable="true">${escapeHtml(epic.epic_name)}</h3>
        </div>
        <span class="pill ${epic.priority}">${epic.priority}</span>
      </div>
      <p class="item-description" contenteditable="true">${escapeHtml(epic.description)}</p>
      <div class="pill-row">
        <span class="pill review">${epic.stories.length} stories</span>
      </div>
    </article>
  `).join("") || empty("No epics match the current filters.");
}

function renderStories() {
  const stories = getStories(state.plan).filter(matchesStoryFilters);
  dom.storyList.innerHTML = stories.map((story) => `
    <article class="story-card">
      <div class="story-card-head">
        <div>
          <p class="meta-line">${story.story_id}</p>
          <h3 contenteditable="true">${escapeHtml(story.story_title)}</h3>
        </div>
        <button class="icon-button" type="button" data-toggle-status="${story.story_id}">${statusLabel(state.statusById[story.story_id])}</button>
      </div>
      <p contenteditable="true">${escapeHtml(story.user_story)}</p>
      <ul>${story.acceptance_criteria.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <div class="pill-row">
        <span class="pill ${story.priority}">${story.priority}</span>
        <span class="pill review">${story.estimate_points} pts</span>
        <span class="pill ${state.statusById[story.story_id]}">${statusLabel(state.statusById[story.story_id])}</span>
      </div>
    </article>
  `).join("") || empty("No stories match the current filters.");

  dom.storyList.querySelectorAll("[data-toggle-status]").forEach((button) => {
    button.addEventListener("click", () => toggleStatus(button.dataset.toggleStatus));
  });
}

function renderTasks() {
  const tasks = getTasks(state.plan).filter(matchesTaskFilters);
  const grouped = owners.reduce((acc, owner) => ({ ...acc, [owner]: [] }), {});
  tasks.forEach((task) => grouped[task.owner_type].push(task));

  dom.taskList.innerHTML = owners
    .filter((owner) => grouped[owner].length)
    .map((owner) => `
      <section class="task-column">
        <h3>${titleCase(owner)}</h3>
        <div class="task-list">
          ${grouped[owner].map((task) => `
            <article class="task-card">
              <strong contenteditable="true">${escapeHtml(task.task_title)}</strong>
              <p contenteditable="true">${escapeHtml(task.description)}</p>
              <div class="pill-row">
                <span class="pill ${state.statusById[task.task_id]}">${statusLabel(state.statusById[task.task_id])}</span>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `).join("") || empty("No tasks match the current filters.");
}

function renderSprints() {
  dom.sprintList.innerHTML = state.plan.sprints.map((sprint) => `
    <article class="sprint-card">
      <div class="sprint-card-head">
        <div>
          <p class="meta-line">${sprint.sprint_id}</p>
          <h3>${sprint.sprint_name}</h3>
        </div>
        <span class="pill ${sprint.allocated_points > sprint.capacity_points ? "high" : "ready"}">${sprint.allocated_points}/${sprint.capacity_points} pts</span>
      </div>
      <p>${escapeHtml(sprint.goal)}</p>
      <ul>${sprint.stories.map((story) => `<li><strong>${story.story_id}</strong>: ${escapeHtml(story.story_title)}. ${escapeHtml(story.reason)}</li>`).join("")}</ul>
    </article>
  `).join("");
}

function renderReview() {
  const review = state.plan.review;
  const blocks = [
    ["Clarifying Questions", review.clarifying_questions],
    ["Oversized Stories", review.oversized_stories.length ? review.oversized_stories : ["None flagged."]],
    ["Unsupported Assumptions", review.unsupported_assumptions.length ? review.unsupported_assumptions : ["None flagged."]],
    ["Duplicate Warnings", review.duplicate_story_warnings.length ? review.duplicate_story_warnings : ["None flagged."]],
  ];

  dom.reviewList.innerHTML = blocks.map(([title, items]) => `
    <article class="review-card">
      <h3>${title}</h3>
      ${list(items)}
    </article>
  `).join("");
}

function matchesEpicFilters(epic) {
  const search = dom.searchFilter.value.trim().toLowerCase();
  const priority = dom.priorityFilter.value;
  return (!search || `${epic.epic_name} ${epic.description}`.toLowerCase().includes(search)) && (priority === "all" || epic.priority === priority);
}

function matchesStoryFilters(story) {
  const search = dom.searchFilter.value.trim().toLowerCase();
  const priority = dom.priorityFilter.value;
  const status = dom.statusFilter.value;
  const owner = dom.ownerFilter.value;
  const text = `${story.story_title} ${story.user_story} ${story.acceptance_criteria.join(" ")}`.toLowerCase();
  const ownersForStory = story.tasks.map((task) => task.owner_type);

  return (!search || text.includes(search))
    && (priority === "all" || story.priority === priority)
    && (status === "all" || state.statusById[story.story_id] === status)
    && (owner === "all" || ownersForStory.includes(owner));
}

function matchesTaskFilters(task) {
  const search = dom.searchFilter.value.trim().toLowerCase();
  const owner = dom.ownerFilter.value;
  const status = dom.statusFilter.value;
  const text = `${task.task_title} ${task.description}`.toLowerCase();

  return (!search || text.includes(search))
    && (owner === "all" || task.owner_type === owner)
    && (status === "all" || state.statusById[task.task_id] === status);
}

function toggleStatus(id) {
  state.statusById[id] = state.statusById[id] === "review" ? "ready" : "review";
  renderPlan();
}

function toMarkdown(plan) {
  const lines = [
    `# ${plan.project_name}`,
    "",
    plan.project_summary,
    "",
    "## Goals",
    ...plan.goals.map((goal) => `- ${goal}`),
    "",
    "## Assumptions",
    ...plan.assumptions.map((assumption) => `- ${assumption}`),
    "",
    "## Epics and Stories",
  ];

  for (const epic of plan.epics) {
    lines.push("", `### ${epic.epic_id}: ${epic.epic_name}`, epic.description, "");
    for (const story of epic.stories) {
      lines.push(`#### ${story.story_id}: ${story.story_title}`);
      lines.push(`Priority: ${story.priority} | Estimate: ${story.estimate_points} points`);
      lines.push(story.user_story);
      lines.push("Acceptance criteria:");
      story.acceptance_criteria.forEach((item) => lines.push(`- ${item}`));
      lines.push("Tasks:");
      story.tasks.forEach((task) => lines.push(`- [${task.owner_type}] ${task.task_title}: ${task.description}`));
      lines.push("");
    }
  }

  lines.push("## Sprint Plan");
  for (const sprint of plan.sprints) {
    lines.push("", `### ${sprint.sprint_name}`, `Goal: ${sprint.goal}`, `Capacity: ${sprint.allocated_points}/${sprint.capacity_points} points`);
    sprint.stories.forEach((story) => lines.push(`- ${story.story_id}: ${story.story_title} - ${story.reason}`));
  }

  lines.push("", "## Review Questions");
  plan.review.clarifying_questions.forEach((question) => lines.push(`- ${question}`));

  return lines.join("\n");
}

function toCsv(plan) {
  const rows = [["type", "id", "title", "priority", "estimate", "owner", "description"]];
  for (const story of getStories(plan)) {
    rows.push(["story", story.story_id, story.story_title, story.priority, story.estimate_points, "", story.user_story]);
    for (const task of story.tasks) {
      rows.push(["task", task.task_id, task.task_title, story.priority, "", task.owner_type, task.description]);
    }
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function inferProjectName(brief) {
  const words = extractKeywords(brief);
  if (!words.length) return "Untitled Project";
  return titleCase(words.slice(0, 2).join(" "));
}

function summarizeBrief(brief, name) {
  const cleaned = brief.replace(/\s+/g, " ").trim();
  const sentence = cleaned.length > 220 ? `${cleaned.slice(0, 220).trim()}...` : cleaned;
  return `${name} is shaped as a focused MVP with a clear backbone of scope, work, review, and delivery. Source brief: ${sentence}`;
}

function inferUsers(brief) {
  const lower = brief.toLowerCase();
  if (lower.includes("student")) return ["students", "project collaborators"];
  if (lower.includes("founder")) return ["founders", "small teams"];
  if (lower.includes("team")) return ["small product teams", "project leads"];
  return ["project planners", "solo builders", "small teams"];
}

function extractKeywords(text) {
  const stop = new Set(["want", "build", "create", "simple", "where", "users", "user", "with", "that", "this", "from", "into", "have", "should", "rough", "project", "idea"]);
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stop.has(word))
    .slice(0, 8);
}

function describeEpic(name) {
  const descriptions = {
    "Project Intake": "Collect the right starting information without making the user fill out a long project document.",
    "Planning Engine": "Transform the brief into structured planning objects that can be reviewed and exported.",
    "Human Review": "Let a person approve, edit, and challenge the generated plan before it becomes execution work.",
    "Export and Sharing": "Package the plan into formats that are useful outside mycellium studio.",
    "Account and Access": "Give users a place to manage plans and control who can use them.",
    "Insights and History": "Help users learn from past planning sessions and improve plan quality.",
    "Notifications": "Keep reviews and handoffs moving without requiring manual follow-up.",
    "Data and Storage": "Persist plans in a structured format that can support later product features.",
  };
  return descriptions[name] || "Group related work into a clear, reviewable part of the product.";
}

function buildAcceptanceCriteria(title, needsReview) {
  const criteria = [
    `${title} can be completed from the main workflow.`,
    "The user receives clear feedback for missing or invalid input.",
    "The result is visible on desktop and mobile layouts.",
  ];

  if (needsReview) {
    criteria.push("A human reviewer can confirm or adjust inferred details.");
  }

  return criteria;
}

function storyNeedsReview(title, brief) {
  const lower = brief.toLowerCase();
  return title.toLowerCase().includes("tool-ready") || lower.length < 180 || lower.includes("maybe") || lower.includes("not sure");
}

function statusLabel(status) {
  return status === "review" ? "Needs Care" : "Ready to Build";
}

function getStories(plan) {
  return plan.epics.flatMap((epic) => epic.stories);
}

function getTasks(plan) {
  return getStories(plan).flatMap((story) => story.tasks);
}

function infoBlock(title, content) {
  return `<article class="info-block"><h3>${title}</h3>${content}</article>`;
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(String(item))}</li>`).join("")}</ul>`;
}

function empty(message) {
  return `<div class="empty-state">${message}</div>`;
}

function uniqueBy(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item[key])) return false;
    seen.add(item[key]);
    return true;
  });
}

function titleCase(value) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "mycellium";
}

function csvCell(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  showToast(`${filename} downloaded.`);
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => dom.toast.classList.remove("show"), 2200);
}

dom.projectBrief.value = "";
dom.exportPreview.value = "";
updateCharCount();

function updateCharCount() {
  if (!dom.charCount) return;
  dom.charCount.textContent = `⌁ ${dom.projectBrief.value.length} characters`;
}
