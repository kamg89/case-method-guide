export const sourceUrl='https://www.sec.gov/Archives/edgar/data/1504776/000150477624000006/wrby-20231231.htm';
export const caseSections = [
 {title:'An investment decision',paragraphs:[
 'It is March 1, 2024. Imagine that you are advising Warby Parker on where to direct its next increment of growth investment. The company sells eyewear through stores and digital channels. Your task is to recommend an investment priority, explain the evidence behind it, and identify what would make you change course. This advisory assignment is an instructional scenario. It is not an account of an actual board meeting or a request made by the company.',
 'The question is deliberately narrower than whether stores or websites are good businesses. Warby Parker already operates both. You must decide which activity deserves greater emphasis now, given the relationship between the channels and the limits of the evidence. A recommendation to invest everywhere would avoid the central choice unless you explain the sequence, the allocation principle, and what must wait.'
 ]},
 {title:'Growth with an unfinished profit story',paragraphs:[
 "The company's reported results offer reasons for both confidence and caution. Net revenue increased from $598.1 million in 2022 to $669.8 million in 2023. Its year-end store count rose from 200 to 237. Gross profit increased, but gross margin declined from 57.0% to 54.5%. The net loss narrowed from $110.4 million to $63.2 million. Exhibit 1 puts these measures together. A larger business and a smaller loss are meaningful developments. Neither, on its own, establishes the return on the next investment.",
 'The measures answer different questions. Revenue records sales. Gross margin concerns the amount left after the cost of those sales, before other operating expenses. Net income includes a broader set of expenses. Store count describes a footprint at a point in time. A claim about attractive new-store economics cannot be established merely by placing a rising revenue line beside a rising store-count line. That claim needs information about costs, timing, customer behavior, and what would have happened without the new location.'
 ]},
 {title:'A customer journey across channels',paragraphs:[
 'A shopper might research frames online, try them in a store, and later complete a purchase online. Another might start with an eye exam in a store. Warby Parker reports that customers move across its physical and digital channels. At the end of 2023, 194 of its 237 stores offered in-person eye exams. These are reported features of the business. They do not tell us how much incremental demand any particular store or digital improvement creates.',
 'For a store advocate, a location can do more than process transactions. It can reduce uncertainty about fit, make services convenient, and give customers a place to seek help. Those mechanisms could support differentiation. They also require execution. The existence of a store does not guarantee that its service is valuable enough to justify its costs. A digital advocate can make a parallel argument about convenience and reach, while still needing evidence that acquisition spending and experience improvements produce profitable customer relationships.'
 ]},
 {title:'What a channel comparison leaves out',paragraphs:[
 'A simple channel ranking risks assigning credit to the place where a transaction ends rather than to the activities that helped generate it. If someone visits a store and later orders online, treating that order as an exclusively digital success may mislead the decision. The opposite error is possible too: a store purchase may follow substantial online research. The useful question is how an investment changes the customer journey and total economics, not which channel receives the final sales label.',
 'The public information supplied here does not provide a controlled comparison of the next store against the next digital project. You have no matched-market experiment, complete acquisition-cost model, or forecast for a particular site. That absence does not make analysis impossible. It changes the strength of the claims you can defend. You can identify a plausible mechanism, show why existing evidence is consistent with it, and state the additional evidence needed before a larger commitment.'
 ]},
 {title:'Three possible priorities',paragraphs:[
 'One option is selective store expansion. This recommendation would put greater emphasis on locations where fitting, service, and eye exams appear likely to strengthen the customer proposition. It needs a disciplined location argument and a way to assess incremental demand. Growth in the network is not itself a sufficient investment criterion. You would need to explain when a proposed location should be rejected, even if opening it would increase reported sales.',
 "A second option is to prioritize the digital experience and customer acquisition. This recommendation would focus on improving discovery, conversion, and repeat purchasing. It needs a specific account of the customer problem being solved and the return the company should measure. Digital spending is not automatically flexible or productive simply because it does not require a new storefront. An unsuccessful campaign can consume resources, and a convenient website may still fail to resolve a customer's need for physical service.",
 "A third option is staged investment. The company could run bounded tests before increasing its commitment. This approach can reduce uncertainty, but it has costs: slower expansion, management attention, and the risk that an inconclusive pilot delays a useful decision. A credible staged recommendation specifies a test, a decision threshold, and a consequence. \"Do a bit of everything\" is not a substitute for those choices."
 ]},
 {title:'Your recommendation',paragraphs:[
 'Use the exhibits to form a position. Choose criteria that reflect the strategic question, such as customer value, incremental economics, capability fit, and reversibility. Explain why your preferred option performs well enough against those criteria, and give the strongest alternative a fair hearing. Name the cost or opportunity you are willing to accept. You may change your recommendation as you work through the exercise. The point is to see whether your reasoning improves when another person challenges it.'
 ]},
];
export const challenge:Record<string,{voice:string;text:string;guide:string}>={
 stores:{voice:'An objection from a finance perspective',text:'You have shown that the network grew, but not that another store will create enough new demand to cover its commitments. How will you distinguish an attractive location from sales that simply move between channels?',guide:'A strong response names an incremental measure, a comparison, and a condition under which you would stop expansion.'},
 digital:{voice:'An objection from a customer-service perspective',text:'What if fitting and eye exams are the reasons customers trust the business? How will an investment in digital conversion preserve that value rather than assume customers no longer need it?',guide:'A strong response identifies the customer task, explains how channels work together, and names evidence that would favor a store instead.'},
 staged:{voice:'An objection from an operating perspective',text:'Testing can postpone a hard decision. What exactly will you test, what result will trigger investment, and what will you do if the evidence remains mixed?',guide:'A strong response sets a bounded test and a decision rule, while acknowledging the cost of waiting.'},
};
export const checklist=`CASE METHOD GUIDE
Preparing for a case discussion

1. Identify the task before taking detailed notes. What decision, evaluation or explanation is needed?
2. Read the opening and ending, then review the structure and exhibits. Form a provisional question.
3. Reread with a purpose. Locate evidence relevant to that question, including details that challenge your first view.
4. Keep a claim, its evidence, and its assumption distinct in your notes. Record the section or exhibit so you can find it during discussion.
5. Compare feasible alternatives against consistent criteria. Explain which criterion should matter most when they conflict.
6. Use calculations to answer an analytical question. State what their inputs and assumptions allow you to conclude.
7. Prepare a concise opening contribution. Include your position, strongest evidence and a material uncertainty.
8. Anticipate a serious objection. Identify what would make you revise your judgment.
9. Listen for changes to the facts, assumptions or criteria. Build on another contribution rather than replaying a prepared speech.
10. After discussion, note what changed and why.

The practice exercise is complete. Use this checklist when a future case is assigned.
`;
