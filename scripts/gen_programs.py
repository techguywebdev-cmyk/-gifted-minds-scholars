# One-off generator for the program pages (src/pages/programs/*.html). Edit data, re-run.
import json, html
P = [
 dict(slug="reading-tutoring", icon="i-book", short="Reading & Literacy",
  name="Reading & Literacy Tutoring", serviceType="Reading tutoring",
  title="Reading Tutoring, Pre-K–5th Grade | Loganville GA & Online | GMS",
  h1="Reading tutoring that builds confident, fluent readers",
  desc="Reading tutoring for Pre-K–5th grade in Loganville, GA and online: phonics, sight words, fluency, vocabulary and comprehension, one scholar at a time.",
  answer="Gifted Minds Scholars offers reading and literacy tutoring for children in Pre-K through 5th grade, in person in Loganville, Georgia and online. Sessions cover phonics and decoding, sight-word recognition, reading fluency, vocabulary, comprehension and spelling.",
  covers=["Phonics & decoding","Sight-word recognition","Reading fluency","Vocabulary development","Reading comprehension","Spelling & word recognition"],
  how="Each session starts from where your child is right now. Mrs. Bonnick builds the foundations step by step — sounds, then words, then sentences and stories — and gives plenty of guided practice so reading starts to feel easy and enjoyable, not stressful.",
  signs=["Has trouble sounding out new words","Reads slowly or guesses at words","Avoids reading or gets frustrated with books","Struggles to remember or explain what they read","Finds spelling especially hard"],
 ),
 dict(slug="math-tutoring", icon="i-calc", short="Mathematics",
  name="Mathematics Tutoring", serviceType="Math tutoring",
  title="Math Tutoring, Pre-K–5th Grade | Loganville GA & Online | GMS",
  h1="Math tutoring that turns “I can’t” into “I’ve got this”",
  desc="Elementary math tutoring for Pre-K through 5th grade in Loganville, GA and online: number sense, place value, the four operations, fractions, decimals and word problems.",
  answer="Gifted Minds Scholars offers math tutoring for children in Pre-K through 5th grade, in person in Loganville, Georgia and online. Sessions cover number recognition, addition and subtraction, multiplication and division, place value, fractions and decimals, word problems and problem-solving strategies.",
  covers=["Number recognition","Addition & subtraction","Multiplication & division","Place value","Fractions & decimals","Word problems","Problem-solving strategies"],
  how="Math builds on itself, so small gaps can grow quickly. Sessions find and fill those gaps, use hands-on and visual explanations so concepts make sense, and practice problem-solving until your child can explain their thinking with confidence.",
  signs=["Gets anxious or upset about math homework","Hasn’t mastered basic facts for their grade","Struggles with word problems","Finds place value, fractions or decimals confusing","Can follow steps but doesn’t understand why"],
 ),
 dict(slug="writing-tutoring", icon="i-pencil", short="Writing & Language Arts",
  name="Writing & Language Arts Tutoring", serviceType="Writing tutoring",
  title="Writing Tutoring, Pre-K–5th Grade | Loganville GA & Online | GMS",
  h1="Writing tutoring that helps children say what they mean",
  desc="Writing tutoring for Pre-K–5th grade in Loganville, GA and online: handwriting, grammar, punctuation, spelling, paragraphs and creative writing.",
  answer="Gifted Minds Scholars offers writing and language arts tutoring for children in Pre-K through 5th grade, in person in Loganville, Georgia and online. Sessions cover handwriting, sentence construction, grammar and punctuation, spelling, paragraph writing, creative writing and written comprehension.",
  covers=["Handwriting","Sentence construction","Grammar & punctuation","Spelling","Paragraph writing","Creative writing","Written comprehension"],
  how="Good writing grows from clear thinking and solid mechanics. Sessions work on both — forming letters and sentences correctly, then organizing ideas into paragraphs and stories — so your child can write with clarity, accuracy and their own voice.",
  signs=["Handwriting is hard to read or slow","Writes very little or avoids writing tasks","Sentences run on or lack punctuation","Has great ideas but struggles to get them on paper","Spelling errors make writing hard to follow"],
 ),
 dict(slug="academic-support", icon="i-bulb", short="Academic Support & Enrichment",
  name="Academic Support & Enrichment", serviceType="Learning support and enrichment",
  title="Dyslexia, ADHD & Learning Support Tutoring | Loganville GA | GMS",
  h1="Academic support for every kind of learner",
  desc="Individualized, multisensory tutoring for Pre-K–5th graders with dyslexia, ADHD and other learning differences, plus enrichment. Loganville, GA and online.",
  answer="Gifted Minds Scholars provides individualized academic support and enrichment for children in Pre-K through 5th grade, in person in Loganville, Georgia and online. This includes multisensory and differentiated instruction and support for children with dyslexia, ADHD and other learning differences.",
  covers=["Individualized instruction","Support for diverse learning needs","Multisensory learning strategies","Differentiated instruction","Academic enrichment","Support for dyslexia, ADHD & other learning differences"],
  how="Every child learns differently. Sessions adapt the pace, format and approach to your child — using multisensory techniques, breaking skills into manageable steps and building in movement and variety where it helps. Children who are ready for more get enrichment that stretches and excites them. If your child has an IEP, 504 plan or evaluation, sharing it helps sessions build on it.",
  signs=["Has a learning difference such as dyslexia or ADHD","Needs more individual attention than a classroom can give","Is falling behind and losing confidence","Learns best with hands-on, visual or multisensory methods","Is ready to be challenged beyond grade level"],
 ),
]
def checks(items): return "\n".join(f'        <li><svg class="i" aria-hidden="true"><use href="#i-check"/></svg>{html.escape(x)}</li>' for x in items)
for p in P:
    others=[o for o in P if o is not p]
    meta=dict(title=p["title"],description=p["desc"],path=f"/programs/{p['slug']}/",type="program",priority=0.85,
              breadcrumb=[["Programs","/programs/"],[p["short"],f"/programs/{p['slug']}/"]],
              serviceName=p["name"],serviceType=p["serviceType"],description_service=p["answer"])
    meta["description"]=p["desc"]
    body=f'''<section class="page-hero">
  <div class="wrap">
    <ol class="crumbs" aria-label="Breadcrumb"><li><a href="/">Home</a></li><li><a href="/programs/">Programs</a></li><li aria-current="page">{html.escape(p["short"])}</li></ol>
    <p class="eyebrow">{html.escape(p["name"])} · Pre-K–5th Grade</p>
    <h1>{p["h1"]}</h1>
    <p class="answer-first">{html.escape(p["answer"])}</p>
  </div>
</section>

<section class="section-tight">
  <div class="wrap detail">
    <div class="prose">
      <h2>What does {html.escape(p["short"].lower())} tutoring cover?</h2>
      <ul class="checks">
{checks(p["covers"])}
      </ul>
      <h2>How do the sessions work?</h2>
      <p>{html.escape(p["how"])}</p>
      <p>Tutoring is available <strong>in person in Loganville, Georgia</strong> or <strong>online</strong>, and every session is scheduled by appointment. Parents receive regular communication and progress updates.</p>
      <h2>Could my child benefit?</h2>
      <p>Families often reach out when their child:</p>
      <ul class="checks">
{checks(p["signs"])}
      </ul>
      <h2>Who teaches the sessions?</h2>
      <p>Sessions are led by <a href="/about/">Mrs. Wendy Bonnick</a>, founder of Gifted Minds Scholars, who has more than {{{{years}}}} years of experience in education and a passion for helping each scholar discover their gifts.</p>
      <figure class="testimonial" style="margin-top:28px">
        <blockquote>“I have seen such an improvement with Cameron. I really appreciate you.”</blockquote>
        <figcaption><span class="avatar" aria-hidden="true">W</span><div>Mrs. Wade<span>Parent</span></div></figcaption>
      </figure>
    </div>
    <aside class="aside-card" aria-label="Schedule and enrollment">
      <h2>Tutoring hours</h2>
      {{{{hoursTable}}}}
      <p style="font-size:.88rem;color:var(--muted);margin:12px 0 0">By appointment, subject to availability.</p>
      <a class="btn btn-gold" href="/enroll/">Enroll your child <svg class="i" aria-hidden="true"><use href="#i-arrow"/></svg></a>
      <a class="btn btn-ghost" href="tel:{{{{phoneE164}}}}" style="margin-top:10px">Call {{{{phone}}}}</a>
    </aside>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <h2 style="font-size:1.6rem;margin-bottom:20px">Explore other programs</h2>
    <div class="related">
''' + "\n".join(f'      <a href="/programs/{o["slug"]}/"><span class="ico"><svg class="i" aria-hidden="true"><use href="#{o["icon"]}"/></svg></span>{html.escape(o["short"])}</a>' for o in others) + '''
    </div>
  </div>
</section>
'''
    meta.pop("description_service")
    meta["serviceDescription"]=p["answer"]
    open(f"src/pages/programs/{p['slug']}.html","w").write("---\n"+json.dumps(meta,indent=2,ensure_ascii=False)+"\n---\n"+body)
print("ok")
